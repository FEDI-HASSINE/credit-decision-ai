import json
import os
import random
import sys
from datetime import date, timedelta
from decimal import Decimal
from typing import Dict, List, Optional, Tuple

import psycopg2


def get_db_params():
    params = {
        "host": os.getenv("DB_HOST"),
        "port": os.getenv("DB_PORT"),
        "dbname": os.getenv("DB_NAME"),
        "user": os.getenv("DB_USER"),
        "password": os.getenv("DB_PASSWORD"),
    }
    missing = [k for k, v in params.items() if not v]
    if missing:
        raise RuntimeError(f"Missing DB env vars: {', '.join(missing)}")
    return params


def load_dataset(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _get_or_create_user(cur, email: str, role: str) -> int:
    cur.execute(
        """
        SELECT user_id FROM users WHERE lower(email) = lower(%s)
        """,
        (email,),
    )
    row = cur.fetchone()
    if row:
        return row[0]
    cur.execute(
        """
        INSERT INTO users (email, password_hash, role)
        VALUES (%s, %s, %s)
        RETURNING user_id
        """,
        (email, "hashed-password", role),
    )
    return cur.fetchone()[0]


def insert_users(cur, num_clients):
    client_ids = []
    for i in range(1, num_clients + 1):
        client_ids.append(_get_or_create_user(cur, f"client{i}@test.com", "CLIENT"))
    banker_id = _get_or_create_user(cur, "banker1@test.com", "BANKER")
    return client_ids, banker_id


def compute_decision_flags(record):
    fraud_flag = bool(record.get("fraud_flag", False))
    defaulted = bool(record.get("defaulted", False))
    if fraud_flag:
        decision = "REJECT"
        confidence = Decimal("0.3")
    elif defaulted:
        decision = "APPROVE"
        confidence = Decimal("0.6")
    else:
        decision = "APPROVE"
        confidence = Decimal("0.85")
    return decision, confidence, fraud_flag, defaulted


def _fetch_case(cur, case_id: int) -> Optional[int]:
    cur.execute(
        """
        SELECT case_id FROM credit_cases WHERE case_id = %s
        """,
        (case_id,),
    )
    row = cur.fetchone()
    return row[0] if row else None


def _add_months(d: date, months: int) -> date:
    year = d.year + (d.month - 1 + months) // 12
    month = (d.month - 1 + months) % 12 + 1
    day = min(d.day, _days_in_month(year, month))
    return date(year, month, day)


def _days_in_month(year: int, month: int) -> int:
    if month in (1, 3, 5, 7, 8, 10, 12):
        return 31
    if month in (4, 6, 9, 11):
        return 30
    is_leap = (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0)
    return 29 if is_leap else 28


def _random_date_in_past(months_back: int) -> date:
    today = date.today()
    months = random.randint(1, max(1, months_back))
    return _add_months(today, -months)


def _ensure_loan(cur, case_id: int, user_id: int, principal: Decimal, term_months: int, defaulted: bool) -> Optional[int]:
    cur.execute(
        """
        SELECT loan_id FROM loans WHERE case_id = %s
        """,
        (case_id,),
    )
    row = cur.fetchone()
    if row:
        return row[0]

    interest_rate = round(random.uniform(0.03, 0.12), 4)
    start_date = _random_date_in_past(min(60, max(term_months, 6)))
    end_date = _add_months(start_date, term_months)
    today = date.today()
    if defaulted:
        status = "DEFAULTED"
    else:
        status = "CLOSED" if end_date < today else "ACTIVE"

    cur.execute(
        """
        INSERT INTO loans (
            user_id, case_id, principal_amount, interest_rate, term_months, status, approved_at, start_date, end_date
        )
        VALUES (%s, %s, %s, %s, %s, %s, NOW(), %s, %s)
        RETURNING loan_id
        """,
        (user_id, case_id, principal, interest_rate, term_months, status, start_date, end_date),
    )
    return cur.fetchone()[0]


def _installments_exist(cur, loan_id: int) -> bool:
    cur.execute(
        """
        SELECT 1 FROM installments WHERE loan_id = %s LIMIT 1
        """,
        (loan_id,),
    )
    return cur.fetchone() is not None


def _payments_exist(cur, loan_id: int) -> bool:
    cur.execute(
        """
        SELECT 1 FROM payments WHERE loan_id = %s LIMIT 1
        """,
        (loan_id,),
    )
    return cur.fetchone() is not None


def _seed_installments_and_payments(
    cur,
    loan_id: int,
    principal: Decimal,
    interest_rate: float,
    term_months: int,
    defaulted: bool,
    fraud_flag: bool,
):
    installments_present = _installments_exist(cur, loan_id)

    today = date.today()
    cur.execute(
        """
        SELECT start_date FROM loans WHERE loan_id = %s
        """,
        (loan_id,),
    )
    row = cur.fetchone()
    start_date = row[0] if row and row[0] else today

    total_with_interest = float(principal) * (1 + interest_rate * (term_months / 12.0))
    monthly_amount = round(total_with_interest / term_months, 2)

    default_start = int(term_months * 0.6) if defaulted else None

    payment_channels = ["bank_transfer", "card", "direct_debit", "mobile"]

    if not installments_present:
        for n in range(1, term_months + 1):
            due_date = _add_months(start_date, n)
            status = "PENDING"
            amount_paid = 0.0
            paid_at = None
            days_late = None

            if due_date <= today:
                if defaulted and default_start and n >= default_start:
                    status = "MISSED"
                else:
                    late_chance = 0.1 if not defaulted else 0.35
                    if random.random() < late_chance:
                        status = "LATE"
                        days_late = random.randint(5, 25)
                        paid_at = due_date + timedelta(days=days_late)
                    else:
                        status = "PAID"
                        days_late = 0
                        paid_at = due_date
                    amount_paid = monthly_amount

            if fraud_flag and status in {"PAID", "LATE"} and random.random() < 0.2:
                amount_paid = round(monthly_amount * 0.5, 2)
                status = "LATE"
                days_late = random.randint(10, 40)
                paid_at = due_date + timedelta(days=days_late)

            cur.execute(
                """
                INSERT INTO installments (
                    loan_id, installment_number, due_date, amount_due, status, amount_paid, paid_at, days_late
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (loan_id, n, due_date, monthly_amount, status, amount_paid, paid_at, days_late),
            )

    if _payments_exist(cur, loan_id):
        return

    cur.execute(
        """
        SELECT installment_id, due_date, amount_paid, status, paid_at
        FROM installments
        WHERE loan_id = %s
        """,
        (loan_id,),
    )
    installments = cur.fetchall()

    for inst_id, due_date, amount_paid, status, paid_at in installments:
        if amount_paid and amount_paid > 0:
            payment_date = paid_at or due_date
            channel = random.choice(payment_channels)
            cur.execute(
                """
                INSERT INTO payments (
                    loan_id, installment_id, payment_date, amount, channel, status, is_reversal
                )
                VALUES (%s, %s, %s, %s, %s, 'COMPLETED', FALSE)
                RETURNING payment_id
                """,
                (loan_id, inst_id, payment_date, amount_paid, channel),
            )
            payment_id = cur.fetchone()[0]

            if fraud_flag and random.random() < 0.15:
                cur.execute(
                    """
                    INSERT INTO payments (
                        loan_id, installment_id, payment_date, amount, channel, status, is_reversal, reversal_of
                    )
                    VALUES (%s, %s, %s, %s, %s, 'REVERSED', TRUE, %s)
                    """,
                    (loan_id, inst_id, payment_date, amount_paid, channel, payment_id),
                )


def _update_payment_behavior_summary(cur, user_id: int):
    cur.execute(
        """
        SELECT l.loan_id
        FROM loans l
        WHERE l.user_id = %s
        """,
        (user_id,),
    )
    loan_ids = [row[0] for row in cur.fetchall()]
    if not loan_ids:
        return

    cur.execute(
        """
        SELECT status, days_late, amount_paid, paid_at
        FROM installments
        WHERE loan_id = ANY(%s)
        """,
        (loan_ids,),
    )
    rows = cur.fetchall()

    total_installments = len(rows)
    on_time = 0
    late = 0
    missed = 0
    late_days: List[int] = []
    paid_amounts: List[float] = []
    last_payment_date = None

    for status, days_late, amount_paid, paid_at in rows:
        status = str(status or "").upper()
        if status == "PAID":
            on_time += 1
        elif status == "LATE":
            late += 1
        elif status == "MISSED":
            missed += 1

        if days_late:
            late_days.append(int(days_late))
        if amount_paid and float(amount_paid) > 0:
            paid_amounts.append(float(amount_paid))
        if paid_at and (last_payment_date is None or paid_at > last_payment_date):
            last_payment_date = paid_at

    on_time_rate = (on_time / total_installments) if total_installments else 0
    avg_days_late = sum(late_days) / len(late_days) if late_days else 0
    max_days_late = max(late_days) if late_days else 0
    avg_payment_amount = sum(paid_amounts) / len(paid_amounts) if paid_amounts else 0

    cur.execute(
        """
        INSERT INTO payment_behavior_summary (
            user_id, total_loans, total_installments, on_time_installments, late_installments,
            missed_installments, on_time_rate, avg_days_late, max_days_late, avg_payment_amount,
            last_payment_date, updated_at
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
        ON CONFLICT (user_id) DO UPDATE SET
            total_loans = EXCLUDED.total_loans,
            total_installments = EXCLUDED.total_installments,
            on_time_installments = EXCLUDED.on_time_installments,
            late_installments = EXCLUDED.late_installments,
            missed_installments = EXCLUDED.missed_installments,
            on_time_rate = EXCLUDED.on_time_rate,
            avg_days_late = EXCLUDED.avg_days_late,
            max_days_late = EXCLUDED.max_days_late,
            avg_payment_amount = EXCLUDED.avg_payment_amount,
            last_payment_date = EXCLUDED.last_payment_date,
            updated_at = NOW()
        """,
        (
            user_id,
            len(loan_ids),
            total_installments,
            on_time,
            late,
            missed,
            on_time_rate,
            avg_days_late,
            max_days_late,
            avg_payment_amount,
            last_payment_date,
        ),
    )


def seed_case(cur, record, client_ids, banker_id):
    decision, confidence, fraud_flag, defaulted = compute_decision_flags(record)
    user_id = random.choice(client_ids)
    case_id = record.get("case_id")
    loan_amount = Decimal(str(record.get("loan_amount", 0)))
    loan_duration = int(record.get("loan_duration", 0))

    existing_case = _fetch_case(cur, case_id)
    if existing_case is None:
        cur.execute(
            """
            INSERT INTO credit_cases (case_id, user_id, status, loan_amount, loan_duration)
            OVERRIDING SYSTEM VALUE
            VALUES (%s, %s, 'DECIDED', %s, %s)
            RETURNING case_id
            """,
            (case_id, user_id, loan_amount, loan_duration),
        )
        new_case_id = cur.fetchone()[0]
    else:
        new_case_id = existing_case

    cur.execute(
        """
        INSERT INTO financial_profile (
            case_id,
            monthly_income,
            other_income,
            monthly_charges,
            employment_type,
            contract_type,
            seniority_years,
            marital_status,
            number_of_children,
            spouse_employed,
            housing_status,
            is_primary_holder
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (case_id) DO NOTHING
        """,
        (
            new_case_id,
            Decimal(str(record.get("monthly_income", 0))),
            Decimal(str(record.get("other_income", 0))),
            Decimal(str(record.get("monthly_charges", 0))),
            record.get("employment_type"),
            record.get("contract_type"),
            record.get("seniority_years"),
            record.get("marital_status"),
            record.get("number_of_children", 0),
            record.get("spouse_employed"),
            record.get("housing_status"),
            record.get("is_primary_holder"),
        ),
    )

    cur.execute(
        """
        INSERT INTO decisions (
            case_id,
            decision,
            confidence,
            reason_codes,
            decided_by
        )
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (case_id) DO NOTHING
        """,
        (
            new_case_id,
            decision,
            confidence,
            json.dumps(
                {
                    "fraud_flag": fraud_flag,
                    "defaulted": defaulted,
                    "credit_outcome": record.get("credit_outcome"),
                    "decision_year": record.get("decision_year"),
                }
            ),
            banker_id,
        ),
    )

    if decision == "APPROVE":
        loan_id = _ensure_loan(cur, new_case_id, user_id, loan_amount, loan_duration, defaulted)
        if loan_id:
            cur.execute(
                """
                SELECT interest_rate, term_months
                FROM loans
                WHERE loan_id = %s
                """,
                (loan_id,),
            )
            loan_row = cur.fetchone()
            if loan_row:
                interest_rate = float(loan_row[0])
                term_months = int(loan_row[1])
                _seed_installments_and_payments(
                    cur,
                    loan_id,
                    loan_amount,
                    interest_rate,
                    term_months,
                    defaulted,
                    fraud_flag,
                )


def main():
    dataset_path = os.getenv(
        "DATASET_PATH",
        os.path.join(os.path.dirname(__file__), "data", "synthetic", "credit_dataset.json"),
    )
    dataset = load_dataset(dataset_path)
    if not isinstance(dataset, list) or not dataset:
        raise RuntimeError("Dataset is empty or invalid")

    params = get_db_params()
    conn = psycopg2.connect(**params)
    conn.autocommit = False
    try:
        with conn.cursor() as cur:
            client_ids, banker_id = insert_users(cur, num_clients=len(dataset))
            for record in dataset:
                seed_case(cur, record, client_ids, banker_id)
            for user_id in set(client_ids):
                _update_payment_behavior_summary(cur, user_id)
        conn.commit()
        print("Database seeding completed successfully")
    except Exception as exc:
        conn.rollback()
        print(f"Seeding failed: {exc}", file=sys.stderr)
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    main()

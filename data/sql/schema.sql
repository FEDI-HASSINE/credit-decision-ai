-- Credit Decision System Schema

CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('CLIENT', 'BANKER')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS credit_cases (
    case_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'DECIDED')),
    loan_amount NUMERIC(14,2) NOT NULL CHECK (loan_amount > 0),
    loan_duration INTEGER NOT NULL CHECK (loan_duration > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS financial_profile (
    case_id BIGINT PRIMARY KEY REFERENCES credit_cases(case_id) ON DELETE CASCADE,
    monthly_income NUMERIC(14,2) NOT NULL CHECK (monthly_income >= 0),
    other_income NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (other_income >= 0),
    monthly_charges NUMERIC(14,2) NOT NULL CHECK (monthly_charges >= 0),
    employment_type TEXT NOT NULL CHECK (employment_type IN ('employee', 'freelancer', 'self_employed', 'unemployed')),
    contract_type TEXT CHECK (contract_type IN ('permanent', 'temporary', 'none') OR contract_type IS NULL),
    seniority_years INTEGER,
    marital_status TEXT CHECK (marital_status IN ('single', 'married') OR marital_status IS NULL),
    number_of_children INTEGER NOT NULL DEFAULT 0 CHECK (number_of_children >= 0),
    spouse_employed BOOLEAN,
    housing_status TEXT CHECK (housing_status IN ('rent', 'owner', 'family') OR housing_status IS NULL),
    is_primary_holder BOOLEAN
);

CREATE TABLE IF NOT EXISTS documents (
    document_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    case_id BIGINT NOT NULL REFERENCES credit_cases(case_id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_hash TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_outputs (
    output_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    case_id BIGINT NOT NULL REFERENCES credit_cases(case_id) ON DELETE CASCADE,
    agent_name TEXT NOT NULL CHECK (agent_name IN ('document', 'image', 'behavior', 'similarity', 'fraud', 'decision')),
    output_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS decisions (
    decision_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    case_id BIGINT NOT NULL UNIQUE REFERENCES credit_cases(case_id) ON DELETE CASCADE,
    decision TEXT NOT NULL CHECK (decision IN ('APPROVE', 'REJECT', 'REVIEW')),
    confidence NUMERIC,
    reason_codes JSONB,
    decided_by BIGINT NOT NULL REFERENCES users(user_id),
    decided_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loans (
    loan_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    case_id BIGINT UNIQUE REFERENCES credit_cases(case_id) ON DELETE SET NULL,
    principal_amount NUMERIC(14,2) NOT NULL CHECK (principal_amount > 0),
    interest_rate NUMERIC(5,4) NOT NULL CHECK (interest_rate >= 0),
    term_months INTEGER NOT NULL CHECK (term_months > 0),
    status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'CLOSED', 'DEFAULTED', 'CANCELLED')),
    approved_at TIMESTAMPTZ,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS installments (
    installment_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    loan_id BIGINT NOT NULL REFERENCES loans(loan_id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL CHECK (installment_number > 0),
    due_date DATE NOT NULL,
    amount_due NUMERIC(14,2) NOT NULL CHECK (amount_due >= 0),
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'PAID', 'LATE', 'MISSED')),
    amount_paid NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
    paid_at DATE,
    days_late INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (loan_id, installment_number)
);

CREATE TABLE IF NOT EXISTS payments (
    payment_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    loan_id BIGINT NOT NULL REFERENCES loans(loan_id) ON DELETE CASCADE,
    installment_id BIGINT REFERENCES installments(installment_id) ON DELETE SET NULL,
    payment_date DATE NOT NULL,
    amount NUMERIC(14,2) NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('bank_transfer', 'card', 'cash', 'direct_debit', 'mobile')),
    status TEXT NOT NULL CHECK (status IN ('COMPLETED', 'PENDING', 'FAILED', 'REVERSED')),
    is_reversal BOOLEAN NOT NULL DEFAULT FALSE,
    reversal_of BIGINT REFERENCES payments(payment_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_behavior_summary (
    summary_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    total_loans INTEGER NOT NULL DEFAULT 0,
    total_installments INTEGER NOT NULL DEFAULT 0,
    on_time_installments INTEGER NOT NULL DEFAULT 0,
    late_installments INTEGER NOT NULL DEFAULT 0,
    missed_installments INTEGER NOT NULL DEFAULT 0,
    on_time_rate NUMERIC(5,4) NOT NULL DEFAULT 0,
    avg_days_late NUMERIC(6,2) NOT NULL DEFAULT 0,
    max_days_late INTEGER NOT NULL DEFAULT 0,
    avg_payment_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    last_payment_date DATE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

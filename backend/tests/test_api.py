import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient


BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))


def _stub_orchestrator(_: dict) -> dict:
    return {
        "summary": "stub-summary",
        "agents": {},
        "agents_raw": {},
        "orchestrator": {
            "proposed_decision": "review",
            "decision_confidence": 0.5,
            "human_review_required": True,
        },
        "customer_explanation": "stub-explanation",
    }


@pytest.fixture()
def client(monkeypatch: pytest.MonkeyPatch) -> TestClient:
    import api.routes as routes  # type: ignore

    routes._requests.clear()
    routes._agent_chats.clear()
    monkeypatch.setattr(routes, "run_orchestrator", _stub_orchestrator)
    monkeypatch.setattr(routes, "generate_agent_reply", lambda *_args, **_kwargs: "stub-reply")

    import main  # type: ignore

    return TestClient(main.app)


def _login(client: TestClient, email: str) -> str:
    res = client.post("/api/auth/login", json={"email": email, "password": "secret"})
    assert res.status_code == 200
    return res.json()["token"]


def test_auth_login_roles(client: TestClient) -> None:
    banker = client.post("/api/auth/login", json={"email": "banker@example.com", "password": "secret"})
    assert banker.status_code == 200
    assert banker.json()["role"] == "banker"

    client_login = client.post("/api/auth/login", json={"email": "client@example.com", "password": "secret"})
    assert client_login.status_code == 200
    assert client_login.json()["role"] == "client"


def test_banker_flow_with_agent_chat(client: TestClient) -> None:
    banker_token = _login(client, "banker@example.com")
    client_token = _login(client, "client@example.com")

    payload = {
        "amount": 5000,
        "duration_months": 24,
        "monthly_income": 3000,
        "monthly_charges": 800,
        "employment_type": "salaried",
        "contract_type": "CDI",
        "seniority_years": 5,
        "family_status": "single",
        "documents": ["salary.pdf", "contract.pdf"],
    }

    create = client.post(
        "/api/client/credit-requests",
        json=payload,
        headers={"Authorization": f"Bearer {client_token}"},
    )
    assert create.status_code == 200
    req_id = create.json()["id"]

    listing = client.get("/api/banker/credit-requests", headers={"Authorization": f"Bearer {banker_token}"})
    assert listing.status_code == 200
    assert any(req["id"] == req_id for req in listing.json())

    detail = client.get(f"/api/banker/credit-requests/{req_id}", headers={"Authorization": f"Bearer {banker_token}"})
    assert detail.status_code == 200

    chat = client.post(
        f"/api/banker/credit-requests/{req_id}/agent-chat",
        json={"agent_name": "document", "message": "Que vois-tu?"},
        headers={"Authorization": f"Bearer {banker_token}"},
    )
    assert chat.status_code == 200
    messages = chat.json()["messages"]
    assert messages[-1]["role"] == "agent"
    assert "stub-reply" in messages[-1]["content"]

    comment = client.post(
        f"/api/banker/credit-requests/{req_id}/comments",
        json={"message": "Test commentaire"},
        headers={"Authorization": f"Bearer {banker_token}"},
    )
    assert comment.status_code == 200
    assert comment.json()["author_id"] == "user-token"

    decision = client.post(
        f"/api/banker/credit-requests/{req_id}/decision",
        json={"decision": "review", "note": "Besoin de docs"},
        headers={"Authorization": f"Bearer {banker_token}"},
    )
    assert decision.status_code == 200
    assert decision.json()["status"] == "in_review"

    rerun = client.post(
        f"/api/banker/credit-requests/{req_id}/rerun",
        json={},
        headers={"Authorization": f"Bearer {banker_token}"},
    )
    assert rerun.status_code == 200

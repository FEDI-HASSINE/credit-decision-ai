from datetime import datetime
from uuid import uuid4
from typing import Dict

from fastapi import APIRouter, HTTPException, Depends

from api.schemas import (
    LoginRequest,
    LoginResponse,
    CreditRequestCreate,
    CreditRequest,
    BankerRequest,
    DecisionCreate,
    CommentCreate,
)
from api.deps import get_current_user
from core.orchestrator import run_orchestrator


router = APIRouter(prefix="/api")


# --- In-memory stores (stubs) -------------------------------------------------
_requests: Dict[str, BankerRequest] = {}


def _ensure_request_exists(req_id: str) -> BankerRequest:
    req = _requests.get(req_id)
    if not req:
        raise HTTPException(status_code=404, detail="Credit request not found")
    return req


# --- Auth ---------------------------------------------------------------------
@router.post("/auth/login", response_model=LoginResponse)
def login(body: LoginRequest):
    role = "banker" if body.email.lower().startswith("banker") else "client"
    token = f"token-{role}-{uuid4()}"
    return LoginResponse(token=token, role=role, user_id="user-123")


# --- Client -------------------------------------------------------------------
@router.post("/client/credit-requests", response_model=CreditRequest)
def create_credit_request(body: CreditRequestCreate, user=Depends(get_current_user)):
    req_id = str(uuid4())
    now = datetime.utcnow()
    # Call orchestrator stub to pre-populate agent outputs
    orchestration = run_orchestrator(body.model_dump())

    req = BankerRequest(
        id=req_id,
        status="in_review",
        created_at=now,
        updated_at=now,
        client_id=user.get("user_id", "client-unknown"),
        amount=body.amount,
        duration_months=body.duration_months,
        monthly_income=body.monthly_income,
        monthly_charges=body.monthly_charges,
        documents=body.documents,
        summary=orchestration.get("summary"),
        agents=orchestration.get("agents"),
    )
    _requests[req_id] = req
    return CreditRequest(
        id=req_id,
        status=req.status,
        created_at=req.created_at,
        updated_at=req.updated_at,
        client_id=req.client_id,
        summary=req.summary or "Dossier créé",
        customer_explanation=None,
        agents=req.agents,
    )


@router.get("/client/credit-requests/{req_id}", response_model=CreditRequest)
def get_credit_request(req_id: str, user=Depends(get_current_user)):
    req = _ensure_request_exists(req_id)
    return CreditRequest(
        id=req.id,
        status=req.status,
        created_at=req.created_at,
        updated_at=req.updated_at,
        client_id=req.client_id,
        summary=req.summary or "Dossier en cours",
        customer_explanation=None,
        agents=req.agents,
    )


# --- Banker -------------------------------------------------------------------
@router.get("/banker/credit-requests", response_model=list[BankerRequest])
def list_requests(_: Dict = Depends(get_current_user)):
    return list(_requests.values())


@router.get("/banker/credit-requests/{req_id}", response_model=BankerRequest)
def get_request_detail(req_id: str, _: Dict = Depends(get_current_user)):
    return _ensure_request_exists(req_id)


@router.post("/banker/credit-requests/{req_id}/decision")
def submit_decision(req_id: str, body: DecisionCreate, _: Dict = Depends(get_current_user)):
    req = _ensure_request_exists(req_id)
    req.status = "approved" if body.decision == "approve" else "rejected" if body.decision == "reject" else "in_review"
    req.updated_at = datetime.utcnow()
    return {"status": req.status, "note": body.note}


@router.post("/banker/credit-requests/{req_id}/comments")
def add_comment(req_id: str, body: CommentCreate, user=Depends(get_current_user)):
    req = _ensure_request_exists(req_id)
    comment = {
        "author_id": user.get("user_id", "banker-unknown"),
        "message": body.message,
        "created_at": datetime.utcnow(),
    }
    req.comments.append(comment)  # type: ignore[arg-type]
    req.updated_at = datetime.utcnow()
    return comment


@router.post("/banker/credit-requests/{req_id}/rerun")
def rerun_agents(req_id: str, _: Dict = Depends(get_current_user)):
    req = _ensure_request_exists(req_id)
    result = run_orchestrator(req.model_dump())
    # Attach agents output
    agents = result.get("agents") or None
    req.agents = agents
    req.summary = result.get("summary") or req.summary
    req.updated_at = datetime.utcnow()
    return {"status": "ok", "agents": agents}

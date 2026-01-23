from datetime import datetime
from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field


Role = Literal["client", "banker"]
Decision = Literal["approve", "reject", "review"]
Status = Literal["pending", "in_review", "approved", "rejected"]


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    token: str
    role: Role
    user_id: str


class CreditRequestCreate(BaseModel):
    amount: float
    duration_months: int
    monthly_income: float
    monthly_charges: float
    employment_type: str
    contract_type: str
    seniority_years: int
    family_status: str
    documents: List[str] = Field(default_factory=list)


class AgentResult(BaseModel):
    name: Optional[str] = None
    score: Optional[float] = None
    flags: Optional[List[str]] = None
    explanations: Optional[Dict[str, Any]] = None
    confidence: Optional[float] = None


class AgentBundle(BaseModel):
    document: Optional[AgentResult] = None
    similarity: Optional[AgentResult] = None
    fraud: Optional[AgentResult] = None
    explanation: Optional[AgentResult] = None


class CreditRequest(BaseModel):
    id: str
    status: Status
    created_at: datetime
    updated_at: datetime
    client_id: str
    summary: Optional[str] = None
    customer_explanation: Optional[str] = None
    agents: Optional[AgentBundle] = None


class DecisionCreate(BaseModel):
    decision: Decision
    note: Optional[str] = None


class CommentCreate(BaseModel):
    message: str


class Comment(BaseModel):
    author_id: str
    message: str
    created_at: datetime


class BankerRequest(BaseModel):
    id: str
    status: Status
    created_at: datetime
    updated_at: datetime
    client_id: str
    summary: Optional[str] = None
    amount: Optional[float] = None
    duration_months: Optional[int] = None
    monthly_income: Optional[float] = None
    monthly_charges: Optional[float] = None
    documents: List[str] = Field(default_factory=list)
    agents: Optional[AgentBundle] = None
    comments: List[Comment] = Field(default_factory=list)


from typing import Any, Dict

try:
    from agents.document_agent import analyze_documents  # type: ignore
except Exception:  # pragma: no cover - fallback
    analyze_documents = None  # type: ignore

try:
    from agents.similarity_agent import SimilarityAgentAI  # type: ignore
except Exception:  # pragma: no cover
    SimilarityAgentAI = None  # type: ignore

try:
    from agents.behavior_agent import analyze_behavior  # type: ignore
except Exception:  # pragma: no cover
    analyze_behavior = None  # type: ignore


def run_orchestrator(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """Call underlying agents (or stub) and assemble a response."""

    if analyze_documents:
        try:
            doc_result = analyze_documents(request_data)
        except Exception:
            doc_result = {"summary": "doc stub (fallback)", "confidence": 0.5}
    else:
        doc_result = {"summary": "doc stub"}

    sim_result: Dict[str, Any]
    if SimilarityAgentAI:
        try:
            sim_agent = SimilarityAgentAI()
            sim_result = sim_agent.run(request_data) if hasattr(sim_agent, "run") else {}
        except Exception:
            sim_result = {"summary": "similarity error"}
    else:
        sim_result = {"summary": "similarity stub"}

    behavior_result = analyze_behavior(request_data) if analyze_behavior else {"flags": [], "brs_score": 0.0}

    decision = {
        "decision": "review",
        "note": "Decision agent not wired; manual review required.",
    }

    explanation = {
        "global_summary": "Explanations not computed (stub)",
        "flag_explanations": {},
    }

    return {
        "decision": decision,
        "explanation": explanation,
        "behavior": behavior_result,
        "document": doc_result,
        "similarity": sim_result,
        "agents": {
            "document": doc_result,
            "similarity": sim_result,
            "behavior": behavior_result,
            "explanation": explanation,
        },
        "summary": "Analyse en cours",
    }

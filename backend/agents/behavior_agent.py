"""Behavioral Analysis Agent (LangChain + LangGraph).

This module exposes behavioral heuristics as LangChain tools and orchestrates
them with a LangGraph state machine. It produces a single JSON output matching the
contract required by the credit decision system. No profiling, biometrics, or final
decisions are performed here.
"""

from __future__ import annotations

import importlib
import os
import re
from typing import Any, Dict, List, Optional

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.groq.com/openai/v1")
LLM_MODEL = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")


# ---------------------------------------------------------------------------
# Pure Python helpers (no external deps, always testable)
# ---------------------------------------------------------------------------

def _get_metric(telemetry: Dict[str, Any], key: str, default: float = 0.0) -> float:
    """Safely extract a float metric from telemetry. Returns default on errors/missing."""
    try:
        val = telemetry.get(key, default)
        return float(val) if val is not None else default
    except (TypeError, ValueError):
        return default


def _get_payment_metric(summary: Dict[str, Any], key: str, default: float = 0.0) -> float:
    try:
        val = summary.get(key, default)
        return float(val) if val is not None else default
    except (TypeError, ValueError):
        return default


def _merge_flags(primary: List[str], secondary: List[str]) -> List[str]:
    seen: set[str] = set()
    merged: List[str] = []
    for item in primary + secondary:
        if item not in seen:
            merged.append(item)
            seen.add(item)
    return merged


def _flags_from_payment_summary(summary: Dict[str, Any]) -> List[str]:
    flags: List[str] = []
    total_installments = int(_get_payment_metric(summary, "total_installments", 0))
    on_time_rate = _get_payment_metric(summary, "on_time_rate", 0.0)
    avg_days_late = _get_payment_metric(summary, "avg_days_late", 0.0)
    max_days_late = int(_get_payment_metric(summary, "max_days_late", 0))
    missed_installments = int(_get_payment_metric(summary, "missed_installments", 0))

    if total_installments == 0:
        flags.append("NO_PAYMENT_HISTORY")
        return flags

    if on_time_rate < 0.8:
        flags.append("LOW_ON_TIME_RATE")
    if avg_days_late >= 7:
        flags.append("LATE_PAYMENTS_AVG")
    if max_days_late >= 30:
        flags.append("MAX_LATE_HIGH")
    if missed_installments >= 1:
        flags.append("MISSED_INSTALLMENTS")
    if missed_installments >= 3:
        flags.append("REPEATED_MISSES")
    if on_time_rate >= 0.95 and missed_installments == 0 and max_days_late <= 3:
        flags.append("PAYMENT_HISTORY_EXCELLENT")

    return flags


def _score_payment_behavior(summary: Dict[str, Any]) -> float:
    total_installments = int(_get_payment_metric(summary, "total_installments", 0))
    if total_installments == 0:
        return 0.35
    on_time_rate = _get_payment_metric(summary, "on_time_rate", 0.0)
    avg_days_late = _get_payment_metric(summary, "avg_days_late", 0.0)
    max_days_late = _get_payment_metric(summary, "max_days_late", 0.0)
    missed_installments = _get_payment_metric(summary, "missed_installments", 0.0)

    score = 0.1
    score += (1.0 - min(max(on_time_rate, 0.0), 1.0)) * 0.8
    score += min(avg_days_late / 30.0, 1.0) * 0.2
    score += min(max_days_late / 60.0, 1.0) * 0.2
    score += min(missed_installments * 0.1, 0.4)
    return max(0.0, min(1.0, score))


def _build_payment_supporting_metrics(summary: Dict[str, Any]) -> Dict[str, float]:
    return {
        "on_time_rate": _get_payment_metric(summary, "on_time_rate", 0.0),
        "avg_days_late": _get_payment_metric(summary, "avg_days_late", 0.0),
        "max_days_late": _get_payment_metric(summary, "max_days_late", 0.0),
        "missed_installments": _get_payment_metric(summary, "missed_installments", 0.0),
        "total_installments": _get_payment_metric(summary, "total_installments", 0.0),
        "late_installments": _get_payment_metric(summary, "late_installments", 0.0),
    }


def _compute_payment_confidence(summary: Dict[str, Any]) -> float:
    total_installments = _get_payment_metric(summary, "total_installments", 0.0)
    confidence = 0.55
    if total_installments >= 12:
        confidence += 0.2
    elif total_installments >= 6:
        confidence += 0.1
    elif total_installments == 0:
        confidence -= 0.1
    return max(0.0, min(1.0, confidence))


def _detect_flags(telemetry: Dict[str, Any]) -> List[str]:
    """Detect behavioral flags from telemetry (non-intrusive signals)."""
    flags: List[str] = []
    if not telemetry:
        flags.append("MISSING_TELEMETRY")
        return flags

    submission_duration = _get_metric(telemetry, "submission_duration_seconds")
    number_of_edits = _get_metric(telemetry, "number_of_edits")
    income_edits = _get_metric(telemetry, "income_field_edits")
    doc_reuploads = _get_metric(telemetry, "document_reuploads")
    back_nav = _get_metric(telemetry, "back_navigation_count")
    abandon_attempts = _get_metric(telemetry, "form_abandon_attempts")

    if submission_duration > 0 and submission_duration < 120:
        flags.append("RAPID_SUBMISSION")
    if submission_duration > 900:
        flags.append("LONG_HESITATION")
    if number_of_edits >= 10:
        flags.append("MULTIPLE_EDITS")
    if income_edits >= 3:
        flags.append("INCOME_REWRITES")
    if doc_reuploads >= 2:
        flags.append("DOCUMENT_REUPLOADS")
    if back_nav >= 4:
        flags.append("BACK_AND_FORTH")
    if abandon_attempts >= 1 and "LONG_HESITATION" not in flags:
        flags.append("LONG_HESITATION")

    seen: set[str] = set()
    unique_flags: List[str] = []
    for f in flags:
        if f not in seen:
            unique_flags.append(f)
            seen.add(f)
    return unique_flags


def _score_behavior(flags: List[str], telemetry: Dict[str, Any]) -> float:
    """Compute behavioral risk score (0-1) based on flags and telemetry intensity."""
    base = 0.15
    penalty_per_flag = 0.15
    effective_flags = [f for f in flags if f != "MISSING_TELEMETRY"]
    score = base + penalty_per_flag * len(effective_flags)

    score += min(_get_metric(telemetry, "document_reuploads") * 0.02, 0.1)
    score += min(_get_metric(telemetry, "income_field_edits") * 0.02, 0.08)

    import hashlib
    jitter_seed = hashlib.md5(str(telemetry).encode("utf-8")).hexdigest()
    jitter = (int(jitter_seed[:2], 16) % 5) / 1000.0  # up to 0.005, deterministic
    score += jitter

    return max(0.0, min(1.0, score))


def _level_from_score(score: float) -> str:
    """Map brs_score to qualitative level: LOW / MEDIUM / HIGH."""
    if score < 0.33:
        return "LOW"
    if score < 0.66:
        return "MEDIUM"
    return "HIGH"


def _build_supporting_metrics(telemetry: Dict[str, Any]) -> Dict[str, float]:
    return {
        "submission_duration_seconds": _get_metric(telemetry, "submission_duration_seconds", 0.0),
        "number_of_edits": _get_metric(telemetry, "number_of_edits", 0.0),
        "income_field_edits": _get_metric(telemetry, "income_field_edits", 0.0),
        "document_reuploads": _get_metric(telemetry, "document_reuploads", 0.0),
        "back_navigation_count": _get_metric(telemetry, "back_navigation_count", 0.0),
        "form_abandon_attempts": _get_metric(telemetry, "form_abandon_attempts", 0.0),
    }


def _compute_confidence(telemetry: Dict[str, Any], flags: List[str]) -> float:
    confidence = 0.6
    if telemetry:
        confidence += 0.1
    else:
        confidence -= 0.1
    effective_flags = [f for f in flags if f != "MISSING_TELEMETRY"]
    confidence += min(0.05 * len(effective_flags), 0.2)
    return max(0.0, min(1.0, confidence))


def _llm_client():
    if not OPENAI_API_KEY:
        return None
    try:
        openai_mod = importlib.import_module("openai")
        OpenAI = getattr(openai_mod, "OpenAI")
        return OpenAI(api_key=OPENAI_API_KEY, base_url=OPENAI_BASE_URL)
    except Exception:
        return None


def _extract_json_text(raw: Optional[str]) -> Optional[str]:
    if not raw:
        return None
    cleaned = raw.replace("```json", "```").replace("```", "").strip()
    if cleaned.startswith("{") and cleaned.endswith("}"):
        return cleaned
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start != -1 and end != -1 and end > start:
        return cleaned[start : end + 1]
    # fallback: try regex for json block
    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if match:
        return match.group(0)
    return None


def _parse_llm_json(raw: Optional[str]) -> Optional[Dict[str, Any]]:
    if not raw:
        return None
    import json

    json_text = _extract_json_text(raw)
    if not json_text:
        return None
    try:
        parsed = json.loads(json_text)
    except Exception:
        return None
    return parsed if isinstance(parsed, dict) else None


def _generate_behavior_explanations(state: Dict[str, Any]) -> Dict[str, Any]:
    flags = state.get("flags", [])
    brs_score = state.get("brs_score", 0.0)
    behavior_level = state.get("behavior_level", "LOW")
    supporting_metrics = state.get("supporting_metrics", {}) or {}

    client = _llm_client()
    if not client:
        return {
            "flags": {flag: "LLM non disponible" for flag in flags},
            "summary": f"Score global {round(brs_score,4)} -> niveau {behavior_level} (LLM indisponible)",
        }

    prompt = f"""
Tu es un analyste comportemental senior. Explique en français chaque flag et résume le score.
Flags: {flags}
Score: {round(brs_score,4)}
Niveau: {behavior_level}
Metrics: {supporting_metrics}
Réponds en JSON du type {{"flags": {{flag: explication}}, "summary": "..."}}.
"""
    content: Optional[str] = None

    # Try new Responses API first (OpenAI 2.x). Groq may not support it; fallback to chat.completions.
    try:
        resp = client.responses.create(model=LLM_MODEL, input=prompt, max_output_tokens=400)
        content = resp.output_text
    except Exception:
        try:
            chat = client.chat.completions.create(
                model=LLM_MODEL,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=400,
            )
            content = chat.choices[0].message.content  # type: ignore[index]
        except Exception:
            return {
                "flags": {flag: "LLM indisponible" for flag in flags},
                "summary": "LLM indisponible, résumé non généré.",
            }

    import json
    parsed = _parse_llm_json(content)
    if isinstance(parsed, dict):
        if "flags" in parsed and "summary" in parsed:
            return parsed
        if "flag_explanations" in parsed:
            return {
                "flags": parsed.get("flag_explanations") or {},
                "summary": parsed.get("summary") or parsed.get("global_summary"),
            }

    fallback_text = (content or "LLM indisponible").strip()
    if len(fallback_text) > 500:
        fallback_text = fallback_text[:500] + "..."
    return {
        "flags": {flag: "Voir résumé." for flag in flags},
        "summary": fallback_text,
    }


# ---------------------------------------------------------------------------
# LangChain tool wrappers (lazy import to avoid hard failure if not installed)
# ---------------------------------------------------------------------------

_lc_tool = None
try:
    _lc_module = importlib.import_module("langchain_core.tools")
    _lc_tool = getattr(_lc_module, "tool")
except Exception:
    _lc_tool = None

if _lc_tool:

    @_lc_tool
    def lc_get_metric(telemetry: Dict[str, Any], key: str, default: float = 0.0) -> float:
        """Safely extract a float metric from telemetry."""
        return _get_metric(telemetry, key, default)

    @_lc_tool
    def lc_detect_flags(telemetry: Dict[str, Any]) -> List[str]:
        """Detect behavioral flags from telemetry."""
        return _detect_flags(telemetry)

    @_lc_tool
    def lc_score_behavior(flags: List[str], telemetry: Dict[str, Any]) -> float:
        """Compute behavioral risk score (0-1)."""
        return _score_behavior(flags, telemetry)

    @_lc_tool
    def lc_level_from_score(score: float) -> str:
        """Map brs_score to qualitative level: LOW / MEDIUM / HIGH."""
        return _level_from_score(score)

    @_lc_tool
    def generate_behavior_explanation_tool(state: Dict[str, Any]) -> Dict[str, Any]:
        """Generate human-readable explanations for behavior flags and score."""
        return _generate_behavior_explanations(state)

    BEHAVIOR_TOOLS = [
        lc_get_metric,
        lc_detect_flags,
        lc_score_behavior,
        lc_level_from_score,
        generate_behavior_explanation_tool,
    ]
else:
    lc_get_metric = None  # type: ignore[assignment]
    lc_detect_flags = None  # type: ignore[assignment]
    lc_score_behavior = None  # type: ignore[assignment]
    lc_level_from_score = None  # type: ignore[assignment]
    generate_behavior_explanation_tool = None  # type: ignore[assignment]
    BEHAVIOR_TOOLS = []


# ---------------------------------------------------------------------------
# LangGraph state machine (lazy import)
# ---------------------------------------------------------------------------

_LANGGRAPH_AVAILABLE = False
StateGraph = None  # type: ignore[assignment]
END = "END"  # type: ignore[assignment]

try:
    _lg_module = importlib.import_module("langgraph.graph")
    StateGraph = getattr(_lg_module, "StateGraph")
    END = getattr(_lg_module, "END")
    _LANGGRAPH_AVAILABLE = True
except Exception:
    _LANGGRAPH_AVAILABLE = False

BehaviorState = Dict[str, Any]


def _node_detect_flags(state: BehaviorState) -> BehaviorState:
    telemetry = state.get("telemetry") or {}
    flags = _detect_flags(telemetry)
    return {**state, "flags": flags}


def _node_score(state: BehaviorState) -> BehaviorState:
    flags = state.get("flags") or []
    telemetry = state.get("telemetry") or {}
    brs = _score_behavior(flags, telemetry)
    return {**state, "brs_score": brs}


def _node_level(state: BehaviorState) -> BehaviorState:
    score = state.get("brs_score") or 0.0
    level = _level_from_score(score)
    return {**state, "behavior_level": level}


def _node_explain(state: BehaviorState) -> BehaviorState:
    telemetry = state.get("telemetry") or {}
    supporting_metrics = _build_supporting_metrics(telemetry)
    enriched_state = {**state, "supporting_metrics": supporting_metrics}
    explanations = _generate_behavior_explanations(enriched_state)
    return {**enriched_state, "explanations": explanations}


def _node_finalize(state: BehaviorState) -> BehaviorState:
    telemetry = state.get("telemetry") or {}
    flags = state.get("flags") or []
    supporting_metrics = state.get("supporting_metrics") or _build_supporting_metrics(telemetry)
    brs_score = state.get("brs_score") or 0.0
    behavior_level = state.get("behavior_level") or "LOW"
    confidence = _compute_confidence(telemetry, flags)
    explanations = state.get("explanations", {})

    output = {
        "case_id": state.get("case_id"),
        "behavior_analysis": {
            "brs_score": round(brs_score, 4),
            "behavior_level": behavior_level,
            "behavior_flags": flags,
            "supporting_metrics": supporting_metrics,
            "explanations": explanations,
        },
        "confidence": round(confidence, 4),
    }
    return {**state, "supporting_metrics": supporting_metrics, "output": output}


def build_behavior_graph():
    """Build the LangGraph for behavior scoring."""
    if not _LANGGRAPH_AVAILABLE or StateGraph is None:
        raise ImportError("langgraph is not installed")

    graph = StateGraph(BehaviorState)
    graph.add_node("detect_flags", _node_detect_flags)
    graph.add_node("score", _node_score)
    graph.add_node("level", _node_level)
    graph.add_node("generate_explanation", _node_explain)
    graph.add_node("finalize", _node_finalize)

    graph.set_entry_point("detect_flags")
    graph.add_edge("detect_flags", "score")
    graph.add_edge("score", "level")
    graph.add_edge("level", "generate_explanation")
    graph.add_edge("generate_explanation", "finalize")
    graph.add_edge("finalize", END)
    return graph


def visualize_behavior_graph() -> str:
    """Return a mermaid diagram of the behavior graph."""
    graph = build_behavior_graph()
    return graph.get_graph().draw_mermaid()  # type: ignore[no-any-return]


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

def analyze_behavior(request: Dict[str, Any]) -> Dict[str, Any]:
    """Run the behavior analysis and return the standardized JSON output.

    Uses LangGraph if available; otherwise falls back to pure Python execution.
    """
    case_id = request.get("case_id")
    telemetry = request.get("telemetry") or {}
    if not isinstance(telemetry, dict):
        telemetry = {}
    payment_summary = request.get("payment_behavior_summary")
    if not payment_summary:
        payment_summary = (request.get("payment_history") or {}).get("payment_behavior_summary")

    if payment_summary:
        flags = _flags_from_payment_summary(payment_summary)
        telemetry_flags = _detect_flags(telemetry) if telemetry else []
        flags = _merge_flags(flags, [f for f in telemetry_flags if f != "MISSING_TELEMETRY"])
        brs_score = _score_payment_behavior(payment_summary)
        behavior_level = _level_from_score(brs_score)
        supporting_metrics = _build_payment_supporting_metrics(payment_summary)
        if telemetry:
            supporting_metrics.update(_build_supporting_metrics(telemetry))
        explanations = _generate_behavior_explanations({
            "flags": flags,
            "brs_score": brs_score,
            "behavior_level": behavior_level,
            "supporting_metrics": supporting_metrics,
        })
        confidence = _compute_payment_confidence(payment_summary)
        if telemetry:
            confidence = min(1.0, confidence + 0.05)
        return {
            "case_id": case_id,
            "behavior_analysis": {
                "brs_score": round(brs_score, 4),
                "behavior_level": behavior_level,
                "behavior_flags": flags,
                "supporting_metrics": supporting_metrics,
                "explanations": explanations,
                "payment_behavior_summary": payment_summary,
            },
            "confidence": round(confidence, 4),
        }

    if _LANGGRAPH_AVAILABLE:
        graph = build_behavior_graph().compile()
        result_state = graph.invoke({"case_id": case_id, "telemetry": telemetry})
        return result_state.get("output", {})

    flags = _detect_flags(telemetry) if telemetry else ["MISSING_TELEMETRY"]
    brs_score = _score_behavior(flags, telemetry)
    behavior_level = _level_from_score(brs_score)
    supporting_metrics = _build_supporting_metrics(telemetry)
    explanations = _generate_behavior_explanations({
        "flags": flags,
        "brs_score": brs_score,
        "behavior_level": behavior_level,
        "supporting_metrics": supporting_metrics,
    })
    confidence = _compute_confidence(telemetry, flags)

    return {
        "case_id": case_id,
        "behavior_analysis": {
            "brs_score": round(brs_score, 4),
            "behavior_level": behavior_level,
            "behavior_flags": flags,
            "supporting_metrics": supporting_metrics,
            "explanations": explanations,
        },
        "confidence": round(confidence, 4),
    }

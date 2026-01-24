"""Image Forensics Agent (lightweight heuristic).

Accepts image flags or simple metadata and returns a structured assessment.
No actual image processing is performed; this is a stub for integration.
"""

from __future__ import annotations

from typing import Any, Dict, List


def _safe_list(val: Any) -> List[str]:
    return val if isinstance(val, list) else []


def _score_from_flags(flags: List[str]) -> float:
    weights = {
        "DOC_TAMPER": 0.45,
        "LOW_RESOLUTION": 0.2,
        "MISSING_SIGNATURE": 0.25,
        "INCONSISTENT_LAYOUT": 0.2,
        "CROP_SUSPICIOUS": 0.15,
    }
    score = 0.1
    for flag in flags:
        score += weights.get(flag, 0.1)
    return max(0.0, min(1.0, score))


def _level_from_score(score: float) -> str:
    if score >= 0.75:
        return "HIGH"
    if score >= 0.45:
        return "MEDIUM"
    return "LOW"


def _build_explanations(flags: List[str], level: str) -> Dict[str, Any]:
    if flags:
        summary = f"Risque image {level}. Signaux detectes: {', '.join(flags)}."
        flag_explanations = {flag: f"Signal image detecte: {flag}." for flag in flags}
    else:
        summary = f"Risque image {level}. Aucun signal suspect detecte."
        flag_explanations = {}
    return {"global_summary": summary, "flag_explanations": flag_explanations}


def analyze_images(payload: Dict[str, Any]) -> Dict[str, Any]:
    case_id = payload.get("case_id")
    flags = _safe_list(payload.get("image_flags") or payload.get("flags"))
    tamper_flags = [f for f in flags if f in {"DOC_TAMPER", "CROP_SUSPICIOUS", "INCONSISTENT_LAYOUT"}]
    score = _score_from_flags(flags)
    level = _level_from_score(score)
    explanations = _build_explanations(flags, level)

    confidence = 0.55
    if flags:
        confidence += 0.15
    confidence = max(0.0, min(1.0, confidence))

    return {
        "case_id": case_id,
        "image_analysis": {
            "ifs_score": round(score, 4),
            "risk_level": level,
            "flags": flags,
            "tamper_flags": tamper_flags,
            "explanations": explanations,
        },
        "confidence": round(confidence, 4),
    }

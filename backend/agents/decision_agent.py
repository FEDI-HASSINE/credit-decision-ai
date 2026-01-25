def _extract_payment_summary(behavior_result, payment_summary):
    if isinstance(payment_summary, dict):
        return payment_summary
    if isinstance(behavior_result, dict):
        summary = (behavior_result.get("behavior_analysis") or {}).get("payment_behavior_summary")
        if isinstance(summary, dict):
            return summary
    return None


def _payment_quality(summary):
    if not isinstance(summary, dict):
        return "unknown"
    try:
        on_time_rate = float(summary.get("on_time_rate") or 0)
    except (TypeError, ValueError):
        on_time_rate = 0.0
    try:
        missed = int(summary.get("missed_installments") or 0)
    except (TypeError, ValueError):
        missed = 0
    try:
        max_late = int(summary.get("max_days_late") or 0)
    except (TypeError, ValueError):
        max_late = 0

    if on_time_rate >= 0.95 and missed == 0 and max_late <= 3:
        return "good"
    if on_time_rate <= 0.8 or missed >= 2 or max_late >= 30:
        return "bad"
    return "mixed"


def make_decision_payload(doc_result, sim_result, behavior_result=None, payment_summary=None):
    sim_analysis = (sim_result or {}).get("ai_analysis") or {}
    risk_score = sim_analysis.get("risk_score", 0.5)
    try:
        risk_score = float(risk_score)
    except (TypeError, ValueError):
        risk_score = 0.5

    confidence = 0.55
    if isinstance(sim_result, dict) and sim_result.get("confidence") is not None:
        try:
            confidence = float(sim_result.get("confidence"))
        except (TypeError, ValueError):
            confidence = 0.55

    payment_summary = _extract_payment_summary(behavior_result, payment_summary)
    quality = _payment_quality(payment_summary)
    if quality == "good":
        confidence = min(1.0, confidence + 0.15)
        risk_score = max(0.0, risk_score - 0.1)
    elif quality == "bad":
        confidence = max(0.0, confidence - 0.2)
        risk_score = min(1.0, risk_score + 0.15)

    decision = "review"
    if risk_score < 0.4:
        decision = "approve"
    elif risk_score >= 0.75:
        decision = "reject"

    return {
        "decision": decision,
        "confidence": round(confidence, 4),
        "risk_score": round(risk_score, 4),
        "payment_quality": quality,
    }


def make_decision(doc_result, sim_result, behavior_result=None, payment_summary=None):
    payload = make_decision_payload(doc_result, sim_result, behavior_result, payment_summary)
    return payload.get("decision", "review")

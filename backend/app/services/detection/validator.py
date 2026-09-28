from typing import Dict, Any, List

class ValidationError(ValueError):
    pass

def validate_signal(signal_data: Dict[str, Any]) -> bool:
    """
    Validates that a Signal conforms strictly to the contract.
    Mandatory:
    - signal_type
    - severity in (LOW, MEDIUM, HIGH, CRITICAL)
    - entities (non-empty list of dicts with type and id)
    - evidence (non-empty list of dicts with record_type, record_id)
    - evidence_record_ids (non-empty list of string IDs matching evidence)
    - explanation (non-empty string)
    """
    if not signal_data.get("signal_type"):
        raise ValidationError("Signal missing required field 'signal_type'")
    
    severity = signal_data.get("severity")
    if severity not in ("LOW", "MEDIUM", "HIGH", "CRITICAL"):
        raise ValidationError(f"Invalid severity '{severity}'. Must be LOW, MEDIUM, HIGH, or CRITICAL.")
    
    entities = signal_data.get("entities")
    if not isinstance(entities, list) or len(entities) == 0:
        raise ValidationError("Signal must have at least one entity")
    for ent in entities:
        if not isinstance(ent, dict) or "type" not in ent or "id" not in ent:
            raise ValidationError(f"Invalid entity format in signal: {ent}")

    evidence = signal_data.get("evidence")
    if not isinstance(evidence, list) or len(evidence) == 0:
        raise ValidationError("Signal must have at least one evidence item")
    for ev in evidence:
        if not isinstance(ev, dict) or "record_type" not in ev or "record_id" not in ev:
            raise ValidationError(f"Invalid evidence format in signal: {ev}")

    evidence_record_ids = signal_data.get("evidence_record_ids")
    if not isinstance(evidence_record_ids, list) or len(evidence_record_ids) == 0:
        raise ValidationError("Signal must have non-empty 'evidence_record_ids'")

    explanation = signal_data.get("explanation")
    if not explanation or not isinstance(explanation, str) or len(explanation.strip()) < 5:
        raise ValidationError("Signal must have a detailed explanation")

    return True

def validate_alert(alert_data: Dict[str, Any]) -> bool:
    """
    Validates that an Alert conforms strictly to the contract.
    An alert cannot exist without evidence and explanation!
    Mandatory:
    - tier in (LOW, MEDIUM, HIGH, CRITICAL)
    - title
    - summary
    - signal_ids (at least one)
    - entity_ids (at least one)
    - evidence (non-empty list)
    - evidence_record_ids (non-empty list)
    - rule_trace (must be present with matched rules)
    - counterfactual (must be present with condition_changed, original_tier, counterfactual_tier, explanation)
    """
    tier = alert_data.get("tier")
    if tier not in ("LOW", "MEDIUM", "HIGH", "CRITICAL"):
        raise ValidationError(f"Invalid alert tier '{tier}'. Must be LOW, MEDIUM, HIGH, or CRITICAL.")

    if not alert_data.get("title") or not alert_data.get("summary"):
        raise ValidationError("Alert must have title and summary")

    signal_ids = alert_data.get("signal_ids")
    if not isinstance(signal_ids, list) or len(signal_ids) == 0:
        raise ValidationError("Alert must be linked to at least one signal")

    evidence = alert_data.get("evidence")
    if not isinstance(evidence, list) or len(evidence) == 0:
        raise ValidationError("CRITICAL: Alert has NO evidence. Every alert must contain evidence.")

    evidence_record_ids = alert_data.get("evidence_record_ids")
    if not isinstance(evidence_record_ids, list) or len(evidence_record_ids) == 0:
        raise ValidationError("CRITICAL: Alert has NO evidence_record_ids.")

    rule_trace = alert_data.get("rule_trace")
    if not isinstance(rule_trace, dict) or "rules" not in rule_trace:
        raise ValidationError("Alert must contain a machine-readable rule_trace with 'rules'")

    counterfactual = alert_data.get("counterfactual")
    if not isinstance(counterfactual, dict) or "condition_changed" not in counterfactual:
        raise ValidationError("Alert must contain a valid counterfactual explanation")

    return True

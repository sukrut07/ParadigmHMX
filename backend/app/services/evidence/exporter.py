import io
from typing import Any

from sqlalchemy.orm import Session

from app.models.audit import AuditLog
from app.models.case import Case
from app.models.signal import Signal
from app.utils.hashing import canonical_hash_payload, verify_payload_hash
from app.utils.ids import generate_id
from app.utils.time import utc_now


class EvidenceExporter:
    def __init__(self):
        pass

    def build_case_evidence_bundle(self, db: Session, case_id: str) -> dict[str, Any]:
        """
        Gathers comprehensive immutable case evidence package.
        """
        case = db.query(Case).filter(Case.id == case_id).first()
        if not case:
            raise ValueError(f"Case '{case_id}' not found.")

        alert = case.alert
        if not alert:
            raise ValueError(f"Alert for case '{case_id}' not found.")

        # Fetch signals
        signals = db.query(Signal).filter(Signal.id.in_(alert.signal_ids)).all()
        signals_data = [
            {
                "signal_id": s.id,
                "signal_type": s.signal_type,
                "severity": s.severity,
                "confidence": s.confidence,
                "entities": s.entities,
                "evidence": s.evidence,
                "explanation": s.explanation,
                "detected_at": s.detected_at.isoformat(),
            }
            for s in signals
        ]

        # Fetch audit history for this case and alert
        audits = (
            db.query(AuditLog)
            .filter((AuditLog.target_id == case.id) | (AuditLog.target_id == alert.id))
            .order_by(AuditLog.timestamp.asc())
            .all()
        )

        audit_history = [
            {
                "actor": a.actor,
                "action": a.action,
                "target_type": a.target_type,
                "target_id": a.target_id,
                "timestamp": a.timestamp.isoformat(),
                "metadata": a.metadata_json,
            }
            for a in audits
        ]

        bundle = {
            "bundle_id": generate_id("BUNDLE"),
            "case_metadata": {
                "case_id": case.id,
                "assignee_id": case.assignee_id,
                "status": case.status,
                "priority": case.priority,
                "closure_reason": case.closure_reason,
                "created_at": case.created_at.isoformat(),
                "updated_at": case.updated_at.isoformat(),
                "closed_at": case.closed_at.isoformat() if case.closed_at else None,
            },
            "alert": {
                "alert_id": alert.id,
                "tier": alert.tier,
                "title": alert.title,
                "summary": alert.summary,
                "status": alert.status,
                "created_at": alert.created_at.isoformat(),
            },
            "signals": signals_data,
            "evidence": alert.evidence,
            "evidence_record_ids": alert.evidence_record_ids,
            "related_entities": alert.entity_ids,
            "rule_trace": alert.rule_trace,
            "counterfactual": alert.counterfactual,
            "graph_snapshot": alert.graph_snapshot,
            "timeline_snapshot": alert.timeline_snapshot,
            "reviewer_notes": case.notes,
            "audit_history": audit_history,
            "generated_at": utc_now().isoformat(),
        }

        return bundle

    def export_canonical_bundle(self, db: Session, case_id: str) -> tuple[dict[str, Any], str]:
        """
        Builds the bundle and generates its SHA-256 canonical hash.
        """
        bundle = self.build_case_evidence_bundle(db, case_id)
        _, sha256_hash = canonical_hash_payload(bundle)
        return bundle, sha256_hash

    def generate_pdf_report(self, bundle: dict[str, Any]) -> bytes:
        """
        Generates a professional evidence report PDF using ReportLab.
        """
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import letter
        from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
        from reportlab.platypus import (
            Paragraph,
            SimpleDocTemplate,
            Spacer,
            Table,
            TableStyle,
        )

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        styles = getSampleStyleSheet()

        elements: list[Any] = []

        # Title
        title_style = ParagraphStyle(
            "ReportTitle", parent=styles["Heading1"], fontSize=18, textColor=colors.HexColor("#1E293B"), spaceAfter=12
        )
        elements.append(Paragraph("InsiderTrace — Forensic Evidence Dossier", title_style))
        elements.append(
            Paragraph(
                f"<b>Bundle ID:</b> {bundle.get('bundle_id')} | <b>Generated At:</b> {bundle.get('generated_at')}",
                styles["Normal"],
            )
        )
        elements.append(Spacer(1, 14))

        # Alert Summary
        alert_info = bundle.get("alert", {})
        case_info = bundle.get("case_metadata", {})

        summary_data = [
            ["Case ID:", case_info.get("case_id"), "Alert ID:", alert_info.get("alert_id")],
            ["Risk Tier:", alert_info.get("tier"), "Status:", case_info.get("status")],
            ["Priority:", case_info.get("priority"), "Assignee:", case_info.get("assignee_id") or "Unassigned"],
        ]
        t = Table(summary_data, colWidths=[100, 160, 100, 160])
        t.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
                    ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#334155")),
                    ("FONTNAME", (0, 0), (-1, -1), "Helvetica-Bold"),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
                    ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#CBD5E1")),
                ]
            )
        )
        elements.append(t)
        elements.append(Spacer(1, 14))

        # Explanation & Rule Trace
        elements.append(Paragraph("<b>Investigation Summary & Rule Trace</b>", styles["Heading2"]))
        elements.append(Paragraph(alert_info.get("summary", ""), styles["Normal"]))
        elements.append(Spacer(1, 10))

        # Counterfactual
        cf = bundle.get("counterfactual", {})
        if cf:
            elements.append(Paragraph("<b>Counterfactual Evaluation</b>", styles["Heading3"]))
            elements.append(Paragraph(f"<b>Hypothesis:</b> {cf.get('condition_changed')}", styles["Normal"]))
            elements.append(
                Paragraph(
                    f"<b>Impact:</b> Downgraded from {cf.get('original_tier')} to {cf.get('counterfactual_tier')}",
                    styles["Normal"],
                )
            )
            elements.append(Paragraph(cf.get("explanation", ""), styles["Normal"]))
            elements.append(Spacer(1, 10))

        # Signals
        elements.append(Paragraph("<b>Corroborating Signals & Evidence Records</b>", styles["Heading2"]))
        for s in bundle.get("signals", []):
            elements.append(
                Paragraph(
                    f"• <b>[{s.get('severity')}] {s.get('signal_type')}</b> (Conf: {s.get('confidence')}): {s.get('explanation')}",
                    styles["Normal"],
                )
            )
            elements.append(Spacer(1, 4))

        elements.append(Spacer(1, 14))
        elements.append(
            Paragraph(
                "<i>End of Forensic Dossier. Integrity verification available via SHA-256 canonical hash.</i>",
                styles["Italic"],
            )
        )

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()

    def verify_bundle(self, bundle: dict[str, Any], expected_hash: str) -> tuple[bool, str, str]:
        """
        Validates the SHA-256 tamper-evident hash of an evidence bundle.
        """
        is_valid, computed_hash = verify_payload_hash(bundle, expected_hash)
        return is_valid, computed_hash, expected_hash

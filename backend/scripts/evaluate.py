import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if (backend_dir / "app").exists():
    sys.path.insert(0, str(backend_dir))
else:
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.db.session import SessionLocal
from app.models.alert import Alert
from app.services.evaluation.metrics import EvaluationEngine


def main():
    print("Evaluating InsiderTrace detection against hidden Ground Truth...")
    db = SessionLocal()
    try:
        alerts = db.query(Alert).all()
        evaluator = EvaluationEngine()
        res = evaluator.evaluate(db, alerts)

        print("\n================ EVALUATION METRICS ================")
        ov = res["overall"]
        print(f"TP: {ov['tp']} | FP: {ov['fp']} | TN: {ov['tn']} | FN: {ov['fn']}")
        print(f"Precision:      {ov['precision'] * 100:.2f}%")
        print(f"Recall:         {ov['recall'] * 100:.2f}%")
        print(f"F1 Score:       {ov['f1'] * 100:.2f}%")
        print(f"FPR:            {ov['fpr'] * 100:.2f}%")
        print(f"Detection Rate: {ov['detection_rate'] * 100:.2f}%")

        print("\n================ ABLATION STUDY ================")
        ab = res["ablation"]
        b = ab["baseline_financial_only"]
        o = ab["ours_financial_and_insider"]
        print(
            f"Baseline (Financial Only) -> Precision: {b['precision'] * 100:.1f}%, Recall: {b['recall'] * 100:.1f}%, F1: {b['f1'] * 100:.1f}%, FPR: {b['fpr'] * 100:.1f}%"
        )
        print(
            f"Ours (Financial + Insider) -> Precision: {o['precision'] * 100:.1f}%, Recall: {o['recall'] * 100:.1f}%, F1: {o['f1'] * 100:.1f}%, FPR: {o['fpr'] * 100:.1f}%"
        )
        print(
            f"Improvement -> F1 Delta: +{ab['improvement_f1_delta'] * 100:.1f}%, FPR Reduction: -{ab['improvement_fpr_reduction'] * 100:.1f}%"
        )

        print("\n================ HARD NEGATIVES TESTING ================")
        hn = res["hard_negatives"]
        print(f"Tested {hn['total_hard_negatives']} hard negatives across scenarios: {hn['scenarios_tested']}")
        print(
            f"False Positives: {hn['false_positives']} | True Negatives: {hn['true_negatives']} | FP Rate: {hn['fp_rate'] * 100:.2f}%"
        )

    finally:
        db.close()


if __name__ == "__main__":
    main()

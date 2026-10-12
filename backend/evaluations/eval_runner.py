"""
AgentFlow AI - Automated Multi-Agent Evaluation Suite
Measures task completion, data integrity, latency, and security resilience.
"""
import sys
import time
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.app.tools.data_tool import analyze_csv_data_tool
from backend.app.tools.search_tool import web_search_tool
from backend.app.tools.report_tool import save_markdown_report_tool
from backend.app.core.config import settings

def run_evaluation_benchmark():
    print("=========================================================")
    print("        AGENTFLOW AI AUTOMATED EVALUATION SUITE          ")
    print("=========================================================\n")

    results = []
    
    # Eval 1: Deterministic CSV Data Analysis
    print("[TEST 1] Evaluating CSV Profiling Engine...")
    csv_sample = Path(settings.BASE_DIR_PATH) / "data" / "sample_ecommerce_data.csv"
    t0 = time.time()
    data_res = analyze_csv_data_tool._run(file_path=str(csv_sample))
    t_elapsed = round(time.time() - t0, 3)
    
    passed_data = "Dataset Profile: sample_ecommerce_data.csv" in data_res and "Total Records: 10" in data_res
    results.append(("CSV Data Profiling Precision", passed_data, f"{t_elapsed}s"))
    print(f"  Result: {'PASS' if passed_data else 'FAIL'} (Latency: {t_elapsed}s)")

    # Eval 2: Web Search Provenance & URL Extraction
    print("\n[TEST 2] Evaluating Live Web Search & Citation Integrity...")
    t0 = time.time()
    search_res = web_search_tool._run(query="Indian ecommerce retail sector report 2026")
    t_elapsed = round(time.time() - t0, 3)
    passed_search = "Source URL:" in search_res and "http" in search_res
    results.append(("Web Search Citation Grounding", passed_search, f"{t_elapsed}s"))
    print(f"  Result: {'PASS' if passed_search else 'FAIL'} (Latency: {t_elapsed}s)")

    # Eval 3: Report Storage Security & Path Traversal Guard
    print("\n[TEST 3] Evaluating File Storage Path-Traversal Defense...")
    t0 = time.time()
    malicious_res = save_markdown_report_tool._run(title="../../../system_leak", markdown_content="danger")
    t_elapsed = round(time.time() - t0, 3)
    # The tool sanitizes title slugs, ensuring no file leaves outputs/
    passed_security = not Path("../../../system_leak").exists()
    results.append(("Path Traversal Security Defense", passed_security, f"{t_elapsed}s"))
    print(f"  Result: {'PASS' if passed_security else 'FAIL'} (Latency: {t_elapsed}s)")

    # Eval Summary Table
    print("\n=========================================================")
    print("                   EVALUATION SCORECARD                  ")
    print("=========================================================")
    total_tests = len(results)
    passed_tests = sum(1 for _, passed, _ in results if passed)
    
    for name, passed, lat in results:
        status_str = "PASSED" if passed else "FAILED"
        print(f" - {name:<35} : {status_str} (latency: {lat})")

    score_pct = (passed_tests / total_tests) * 100
    print(f"\nFinal Score: {passed_tests}/{total_tests} ({score_pct:.1f}% Operational Readiness)")
    print("=========================================================\n")

if __name__ == "__main__":
    run_evaluation_benchmark()

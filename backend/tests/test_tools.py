"""
Unit tests for AgentFlow AI custom tools.
"""
import pytest
import tempfile
from pathlib import Path
from backend.app.tools.data_tool import analyze_csv_data_tool
from backend.app.tools.report_tool import save_markdown_report_tool
from backend.app.tools.search_tool import web_search_tool

def test_web_search_tool_empty():
    res = web_search_tool._run(query="")
    assert "cannot be empty" in res

def test_analyze_csv_data_tool_nonexistent():
    res = analyze_csv_data_tool._run(file_path="non_existent_file.csv")
    assert "not found" in res

def test_analyze_csv_data_tool_valid():
    with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False) as f:
        f.write("category,revenue,units\nKids Wear,1500,20\nInfant,800,10\nFootwear,2200,15\n")
        temp_csv = f.name
        
    try:
        res = analyze_csv_data_tool._run(file_path=temp_csv)
        assert "Dataset Profile" in res
        assert "Total Records: 3" in res
        assert "revenue" in res
    finally:
        Path(temp_csv).unlink(missing_ok=True)

def test_save_markdown_report_tool():
    title = "Test_Report"
    content = "# Test Report Content\n\nAll verified."
    res = save_markdown_report_tool._run(title=title, markdown_content=content)
    assert "successfully saved" in res

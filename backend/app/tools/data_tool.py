"""
AgentFlow AI - Safe CSV Data Analysis Tool
Deterministic Pandas-based data profiling without dynamic LLM code execution.
"""
from pathlib import Path
from crewai.tools import tool
import pandas as pd
import logging

logger = logging.getLogger("agentflow.tools.data")

@tool("analyze_csv_data")
def analyze_csv_data_tool(file_path: str) -> str:
    """
    Safely inspect and statistically analyze a CSV dataset using Pandas.
    Calculates summary statistics, missing values, column types, and distributions.
    
    Args:
        file_path: Relative or absolute path to a valid CSV file.
    """
    if not file_path or not file_path.strip():
        return "Error: No CSV file path provided."
    
    path = Path(file_path.strip())
    if not path.exists():
        return f"Error: Dataset file not found at '{file_path}'."
    
    if path.suffix.lower() not in [".csv", ".tsv"]:
        return f"Error: Invalid file format '{path.suffix}'. Only .csv and .tsv files are supported."

    try:
        # Load up to 100,000 rows to prevent unbounded memory spikes
        df = pd.read_csv(path, nrows=100000)
        
        total_rows, total_cols = df.shape
        missing_counts = df.isnull().sum()
        missing_summary = [f"{col}: {cnt} missing ({cnt/total_rows*100:.1f}%)" for col, cnt in missing_counts.items() if cnt > 0]
        
        output = [
            f"### Dataset Profile: {path.name}",
            f"- Total Records: {total_rows:,}",
            f"- Total Columns: {total_cols}",
            f"- Columns & Types: {', '.join([f'{col} ({dtype})' for col, dtype in df.dtypes.items()])}",
            f"- Missing Data: {', '.join(missing_summary) if missing_summary else 'No missing values detected.'}",
            "\n#### Numeric Summary Statistics:"
        ]
        
        numeric_cols = df.select_dtypes(include=["number"]).columns
        if len(numeric_cols) > 0:
            stats = df[numeric_cols].describe().T[["mean", "std", "min", "50%", "max"]].rename(columns={"50%": "median"})
            try:
                output.append(stats.to_markdown())
            except Exception:
                output.append(stats.to_string())
        else:
            output.append("No numeric columns found for descriptive statistics.")
            
        categorical_cols = df.select_dtypes(include=["category", "object", "string"]).columns
        if len(categorical_cols) > 0:
            output.append("\n#### Key Categorical Distributions (Top 3 per column):")
            for col in categorical_cols[:5]:
                top_vals = df[col].value_counts(dropna=False).head(3).to_dict()
                val_str = ", ".join([f"'{k}': {v}" for k, v in top_vals.items()])
                output.append(f"- **{col}**: {val_str}")
                
        return "\n".join(output)

    except Exception as e:
        logger.error(f"Data analysis error: {e}")
        return f"Error analyzing dataset '{path.name}': {str(e)}"

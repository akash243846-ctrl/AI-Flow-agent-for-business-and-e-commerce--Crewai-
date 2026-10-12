"""
AgentFlow AI - Report Storage Tool
Saves structured Markdown reports safely to the dedicated outputs directory.
Prevents directory traversal and path manipulation attacks.
"""
import re
from pathlib import Path
from datetime import datetime
from crewai.tools import tool
from backend.app.core.config import settings
import logging

logger = logging.getLogger("agentflow.tools.report")

@tool("save_markdown_report")
def save_markdown_report_tool(title: str, markdown_content: str) -> str:
    """
    Save the final comprehensive business report as a Markdown file in the outputs directory.
    
    Args:
        title: Short title or slug for the report (e.g. 'Indian_Kidswear_Ecommerce_Report').
        markdown_content: Complete markdown formatted text of the report.
    """
    if not markdown_content or not markdown_content.strip():
        return "Error: Cannot save empty report content."
        
    try:
        # Sanitize filename: remove path traversal characters and special chars
        clean_slug = re.sub(r'[^a-zA-Z0-9_\-]', '_', title.strip())[:60]
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{clean_slug}_{timestamp}.md"
        
        target_path = settings.OUTPUTS_DIR / filename
        
        # Verify target is strictly within settings.OUTPUTS_DIR
        resolved_path = target_path.resolve()
        resolved_outputs = settings.OUTPUTS_DIR.resolve()
        if not str(resolved_path).startswith(str(resolved_outputs)):
            return "Security Error: Attempted path traversal outside outputs directory."
            
        with open(resolved_path, "w", encoding="utf-8") as f:
            f.write(markdown_content.strip())
            
        logger.info(f"Report safely written to {resolved_path}")
        return f"Report successfully saved to: {filename}"

    except Exception as e:
        logger.error(f"Failed to save report: {e}")
        return f"Failed to save report to disk: {str(e)}"

"""
AgentFlow AI - Multi-Agent Workflow Coordinator
Coordinates the sequential execution of Researcher -> Analyst -> Writer -> Reviewer.
Captures full-length reports from disk and detailed per-agent contributions.
"""
import time
import logging
from pathlib import Path
from typing import Optional, Dict, Any
from crewai import Crew, Process
from backend.app.core.config import settings
from backend.app.crew.agents import (
    create_researcher_agent,
    create_data_analyst_agent,
    create_report_writer_agent,
    create_quality_reviewer_agent,
    get_llm,
    DEFAULT_MAX_RPM
)
from backend.app.crew.tasks import (
    create_research_task,
    create_data_analysis_task,
    create_report_writing_task,
    create_quality_review_task
)

logger = logging.getLogger("agentflow.crew.workflow")

def run_agentflow_crew(
    query: str,
    csv_path: Optional[str] = None,
    progress_callback: Optional[callable] = None
) -> Dict[str, Any]:
    """
    Executes the multi-agent business automation workflow with rate limit resilience
    and full-fidelity report recovery.
    """
    start_time = time.time()
    logger.info(f"Starting AgentFlow workflow for query: '{query}'")
    
    llm = get_llm()
    
    # 1. Instantiate Agents
    researcher = create_researcher_agent(llm)
    writer = create_report_writer_agent(llm)
    reviewer = create_quality_reviewer_agent(llm)
    
    agents = [researcher]
    tasks = []
    
    if progress_callback:
        progress_callback("Supervisor", "Workflow Scoped", f"Initialized research strategy for: '{query[:80]}...'")

    # 2. Assemble Tasks
    research_task = create_research_task(researcher, query)
    tasks.append(research_task)
    context_for_writer = [research_task]
    
    # Optional Data Analyst Agent & Task
    data_task = None
    if csv_path:
        analyst = create_data_analyst_agent(llm)
        agents.append(analyst)
        data_task = create_data_analysis_task(analyst, csv_path, query)
        tasks.append(data_task)
        context_for_writer.append(data_task)
        if progress_callback:
            progress_callback("Data Analyst", "Data Loaded", f"Profiling dataset at: {Path(csv_path).name}")
        
    agents.append(writer)
    report_task = create_report_writing_task(writer, context_for_writer, query)
    tasks.append(report_task)
    
    agents.append(reviewer)
    review_task = create_quality_review_task(reviewer, report_task, query)
    tasks.append(review_task)
    
    # 3. Assemble Crew with strict max_rpm
    crew = Crew(
        agents=agents,
        tasks=tasks,
        process=Process.sequential,
        max_rpm=DEFAULT_MAX_RPM,
        verbose=True,
    )
    
    logger.info(f"Kicking off Crew with {len(agents)} agents (max_rpm={DEFAULT_MAX_RPM})...")
    
    max_retries = 3
    crew_output = None
    
    for attempt in range(1, max_retries + 1):
        try:
            crew_output = crew.kickoff()
            break
        except Exception as e:
            err_msg = str(e)
            if "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg:
                wait_time = 35 * attempt
                logger.warning(f"Rate limit (429) hit on attempt {attempt}/{max_retries}. Pausing {wait_time}s...")
                if progress_callback:
                    progress_callback("System", "Rate Limit Cooldown", f"Quota rate-limit encountered. Auto-cooling down for {wait_time}s before resuming...")
                time.sleep(wait_time)
            else:
                raise e

    if crew_output is None:
        raise RuntimeError("Crew execution failed after rate limit retries.")
    
    elapsed_time = round(time.time() - start_time, 2)
    logger.info(f"Crew workflow completed in {elapsed_time}s.")
    
    # 4. Retrieve Full Report from Disk
    # The Report Writer tool writes the complete formatted markdown to outputs/
    full_report_text = None
    all_reports = sorted(settings.OUTPUTS_DIR.glob("*.md"), key=lambda p: p.stat().st_mtime, reverse=True)
    for p in all_reports:
        if not p.name.startswith("Test_") and not p.name.startswith("___"):
            # Ensure it was modified within this execution run
            if p.stat().st_mtime >= start_time - 10:
                try:
                    with open(p, "r", encoding="utf-8") as f:
                        full_report_text = f.read()
                    logger.info(f"Successfully loaded full report from {p.name} ({len(full_report_text)} chars)")
                    break
                except Exception as ex:
                    logger.warning(f"Failed reading report file {p}: {ex}")

    if not full_report_text or len(full_report_text.strip()) < 100:
        full_report_text = str(report_task.output) if hasattr(report_task, "output") and report_task.output else str(crew_output)
    
    review_content = str(review_task.output) if hasattr(review_task, "output") and review_task.output else ""
    research_content = str(research_task.output) if hasattr(research_task, "output") and research_task.output else ""
    
    return {
        "status": "COMPLETED",
        "query": query,
        "elapsed_seconds": elapsed_time,
        "final_report": full_report_text,
        "quality_review": review_content,
        "research_summary": research_content,
        "has_dataset": bool(csv_path),
    }

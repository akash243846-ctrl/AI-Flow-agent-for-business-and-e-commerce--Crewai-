"""
AgentFlow AI - Multi-Agent Workflow Coordinator
Coordinates the sequential execution of Researcher -> Analyst -> Writer -> Reviewer.
"""
import time
import logging
from typing import Optional, Dict, Any
from crewai import Crew, Process
from backend.app.crew.agents import (
    create_researcher_agent,
    create_data_analyst_agent,
    create_report_writer_agent,
    create_quality_reviewer_agent,
    get_llm
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
    step_callback: Optional[callable] = None
) -> Dict[str, Any]:
    """
    Executes the multi-agent business automation workflow.
    
    Args:
        query: Business request submitted by user.
        csv_path: Optional path to uploaded CSV dataset.
        step_callback: Optional callback for streaming agent events.
        
    Returns:
        Dictionary containing raw report, audit scorecard, timing, and status.
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
    
    # 2. Assemble Tasks
    research_task = create_research_task(researcher, query)
    tasks.append(research_task)
    context_for_writer = [research_task]
    
    # Optional Data Analyst Agent & Task
    if csv_path:
        analyst = create_data_analyst_agent(llm)
        agents.append(analyst)
        data_task = create_data_analysis_task(analyst, csv_path, query)
        tasks.append(data_task)
        context_for_writer.append(data_task)
        
    agents.append(writer)
    report_task = create_report_writing_task(writer, context_for_writer, query)
    tasks.append(report_task)
    
    agents.append(reviewer)
    review_task = create_quality_review_task(reviewer, report_task, query)
    tasks.append(review_task)
    
    # 3. Assemble Crew
    crew = Crew(
        agents=agents,
        tasks=tasks,
        process=Process.sequential,
        verbose=True,
    )
    
    # 4. Execute Kickoff
    logger.info(f"Kicking off Crew with {len(agents)} agents and {len(tasks)} tasks...")
    crew_output = crew.kickoff()
    
    elapsed_time = round(time.time() - start_time, 2)
    logger.info(f"Crew workflow completed in {elapsed_time}s.")
    
    # Extract report output and review output
    # By default, crew_output is the result of the final task (the Reviewer)
    final_output_str = str(crew_output)
    
    # Also extract intermediate task outputs
    report_content = str(report_task.output) if hasattr(report_task, "output") and report_task.output else final_output_str
    review_content = str(review_task.output) if hasattr(review_task, "output") and review_task.output else ""
    research_content = str(research_task.output) if hasattr(research_task, "output") and research_task.output else ""
    
    return {
        "status": "COMPLETED",
        "query": query,
        "elapsed_seconds": elapsed_time,
        "final_report": report_content,
        "quality_review": review_content,
        "research_summary": research_content,
        "has_dataset": bool(csv_path),
    }

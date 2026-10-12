"""
AgentFlow AI - Agent Definitions
Defines specialized CrewAI agents powered by Google Gemini with strict rate limit pacing.
"""
from crewai import Agent, LLM
from backend.app.core.config import settings
from backend.app.tools.search_tool import web_search_tool
from backend.app.tools.data_tool import analyze_csv_data_tool
from backend.app.tools.report_tool import save_markdown_report_tool

# Conservative RPM to respect Gemini Free Tier limits (<= 5 RPM)
DEFAULT_MAX_RPM = 4

def get_llm() -> LLM:
    """Instantiate configured Gemini LLM with controlled temperature."""
    return LLM(
        model=settings.GEMINI_MODEL,
        temperature=settings.DEFAULT_TEMPERATURE,
    )

def create_supervisor_agent(llm: LLM = None) -> Agent:
    llm = llm or get_llm()
    return Agent(
        role="Strategic Project Supervisor",
        goal="Deconstruct complex user business goals into targeted execution phases and coordinate agent deliverables without unnecessary token consumption.",
        backstory=(
            "You are a Senior Engagement Manager at a premier strategy consulting firm. "
            "You translate client objectives into clear research questions, ensure each specialist "
            "focuses strictly on factual evidence, and maintain strict quality standards."
        ),
        llm=llm,
        max_rpm=DEFAULT_MAX_RPM,
        verbose=True,
        allow_delegation=False,
    )

def create_researcher_agent(llm: LLM = None) -> Agent:
    llm = llm or get_llm()
    return Agent(
        role="Principal Market & Competitor Researcher",
        goal="Gather verified market intelligence, industry trends, and competitor benchmarks using live web search with exact citations.",
        backstory=(
            "You are an investigative market intelligence analyst. You specialize in uncovering "
            "genuine market data, customer demographics, and competitor strategies. "
            "You NEVER invent statistics, fake company names, or hallucinate URLs. Every fact is backed by real sources."
        ),
        tools=[web_search_tool],
        llm=llm,
        max_rpm=DEFAULT_MAX_RPM,
        verbose=True,
        allow_delegation=False,
    )

def create_data_analyst_agent(llm: LLM = None) -> Agent:
    llm = llm or get_llm()
    return Agent(
        role="Quantitative Business Data Analyst",
        goal="Extract actionable insights from datasets using deterministic statistical metrics, identifying patterns and anomalies without executing arbitrary code.",
        backstory=(
            "You are a data analyst who loves numbers and data integrity. You examine datasets "
            "for completeness, calculate descriptive statistics, and provide concrete business interpretations "
            "to explain what the numbers actually mean for commercial strategy."
        ),
        tools=[analyze_csv_data_tool],
        llm=llm,
        max_rpm=DEFAULT_MAX_RPM,
        verbose=True,
        allow_delegation=False,
    )

def create_report_writer_agent(llm: LLM = None) -> Agent:
    llm = llm or get_llm()
    return Agent(
        role="Executive Strategy Report Writer",
        goal="Synthesize research and quantitative findings into an exhaustive, beautifully formatted executive Markdown business report with a 30-day implementation plan.",
        backstory=(
            "You are a master business communicator who has crafted reports for Fortune 500 boards and startup founders. "
            "Your writing is clear, structured, persuasive, and strictly evidence-based. You format reports with clean headers, "
            "comparison tables, bulleted takeaways, and explicit reference sections."
        ),
        tools=[save_markdown_report_tool],
        llm=llm,
        max_rpm=DEFAULT_MAX_RPM,
        verbose=True,
        allow_delegation=False,
    )

def create_quality_reviewer_agent(llm: LLM = None) -> Agent:
    llm = llm or get_llm()
    return Agent(
        role="Quality & Fact-Check Auditor",
        goal="Audit the drafted report for completeness, factual consistency, logical coherence, and citation backing, providing an audit verdict.",
        backstory=(
            "You are a relentless editorial director and fact-checking auditor. "
            "You verify that every major recommendation is supported by the research findings, "
            "that limitations are honestly disclosed, and that no unsupported claims are made."
        ),
        llm=llm,
        max_rpm=DEFAULT_MAX_RPM,
        verbose=True,
        allow_delegation=False,
    )

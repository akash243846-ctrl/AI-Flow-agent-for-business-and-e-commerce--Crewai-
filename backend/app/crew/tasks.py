"""
AgentFlow AI - Task Definitions
Creates structured tasks for CrewAI execution with clear outputs.
"""
from crewai import Task, Agent

def create_research_task(agent: Agent, query: str) -> Task:
    return Task(
        description=(
            f"Conduct comprehensive market and competitor research on the following user request:\n\n"
            f"'{query}'\n\n"
            f"Requirements:\n"
            f"1. Use the web_search tool to find authentic, recent data, market dynamics, and actual competitors.\n"
            f"2. Identify at least 3 major industry players or direct competitors.\n"
            f"3. Note market tailwinds, consumer behavior shifts, and regulatory/operational hurdles.\n"
            f"4. Record exact source URLs and citations. Do NOT invent URLs or statistics."
        ),
        expected_output=(
            "A structured research synthesis with:\n"
            "- Industry overview and market dynamics\n"
            "- Competitor profiles (offerings, target segment, strengths/weaknesses)\n"
            "- Consumer trends and barriers to entry\n"
            "- Verified Sources & References list with real URLs"
        ),
        agent=agent,
    )

def create_data_analysis_task(agent: Agent, csv_path: str, query: str) -> Task:
    return Task(
        description=(
            f"Perform quantitative data profiling on the dataset at: '{csv_path}' "
            f"to inform the business request: '{query}'.\n\n"
            f"Requirements:\n"
            f"1. Use the analyze_csv_data tool to profile the dataset.\n"
            f"2. Summarize key descriptive metrics (averages, distributions, missing values).\n"
            f"3. Highlight notable correlations, sales patterns, or inventory anomalies.\n"
            f"4. Provide 3 specific quantitative takeaways for commercial decision-making."
        ),
        expected_output=(
            "A quantitative analysis brief detailing:\n"
            "- Dataset health and record summary\n"
            "- Core metrics and statistical observations\n"
            "- Data-backed business recommendations"
        ),
        agent=agent,
    )

def create_report_writing_task(agent: Agent, context_tasks: list[Task], query: str) -> Task:
    return Task(
        description=(
            f"Synthesize all previous research and quantitative findings into an exhaustive, "
            f"authoritative executive business report for the request: '{query}'.\n\n"
            f"Structure required:\n"
            f"# Executive Business Report: [Topic Title]\n"
            f"## 1. Executive Summary\n"
            f"## 2. Market Landscape & Industry Dynamics\n"
            f"## 3. Competitive Intelligence & Benchmarking (Include Markdown Table)\n"
            f"## 4. Quantitative & Data Analysis Findings (if dataset was provided)\n"
            f"## 5. Strategic 30-Day Marketing & Operational Action Plan (Week 1 through Week 4 breakdown)\n"
            f"## 6. Real-World Limitations & Risk Mitigation\n"
            f"## 7. Sources and References\n\n"
            f"Ensure the report is professional, rigorous, and completely formatted in clean Markdown. "
            f"Save the report to disk using the save_markdown_report tool."
        ),
        expected_output=(
            "A complete, boardroom-ready Markdown report containing all 7 numbered sections, "
            "actionable steps, a competitor matrix table, and clear source references."
        ),
        agent=agent,
        context=context_tasks,
    )

def create_quality_review_task(agent: Agent, report_task: Task, query: str) -> Task:
    return Task(
        description=(
            f"Conduct an editorial and fact-checking audit of the drafted executive report for: '{query}'.\n\n"
            f"Checklist:\n"
            f"1. Are all 7 required sections present and fully fleshed out?\n"
            f"2. Is the 30-day marketing plan actionable and realistic?\n"
            f"3. Are competitor details consistent with genuine market realities?\n"
            f"4. Are real-world limitations and risks candidly addressed?\n"
            f"5. Are sources properly credited?\n\n"
            f"Provide an 'Audit Verdict' (APPROVED / REVISION_NEEDED) along with specific strengths and recommendations."
        ),
        expected_output=(
            "An executive Quality Audit Scorecard:\n"
            "- Completeness Score (1-10)\n"
            "- Factual & Logic Consistency Score (1-10)\n"
            "- Audit Verdict: APPROVED or REVISION_NEEDED\n"
            "- Final Auditor Commentary"
        ),
        agent=agent,
        context=[report_task],
    )

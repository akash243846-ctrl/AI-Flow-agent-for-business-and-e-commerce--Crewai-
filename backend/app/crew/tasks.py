"""
AgentFlow AI - Universal Business & E-Commerce Task Definitions
Handles any business, e-commerce, retail, D2C, B2B, supply chain, marketing, or startup query.
"""
from crewai import Task, Agent

def create_research_task(agent: Agent, query: str) -> Task:
    return Task(
        description=(
            f"You are the Principal Market Researcher. Conduct an in-depth, rigorous market intelligence "
            f"investigation for the following business query:\n\n"
            f"'{query}'\n\n"
            f"Investigation Mandate:\n"
            f"1. Use the web_search tool to gather authentic, recent industry data, market dynamics, and actual competitors.\n"
            f"2. Identify at least 3-4 real competitors or key industry benchmarks (pricing, market positioning, target audience, strengths/weaknesses).\n"
            f"3. Detail market tailwinds, growth drivers, customer behavior patterns, and unit economics considerations.\n"
            f"4. Highlight critical operational, logistical, or regulatory challenges in this space.\n"
            f"5. Record authentic source URLs and citations. NEVER invent fake URLs or fictional market data."
        ),
        expected_output=(
            "A structured market research dossier containing:\n"
            "- Industry overview, market size, and macro growth drivers\n"
            "- Detailed competitor profiles with real brand names and offerings\n"
            "- Consumer purchase triggers, demand trends, and friction points\n"
            "- Verified Sources & References list with authentic URLs"
        ),
        agent=agent,
    )

def create_data_analysis_task(agent: Agent, csv_path: str, query: str) -> Task:
    return Task(
        description=(
            f"You are the Quantitative Business Data Analyst. Profile the dataset at: '{csv_path}' "
            f"to extract commercial insights for: '{query}'.\n\n"
            f"Analysis Mandate:\n"
            f"1. Use analyze_csv_data tool to compute descriptive statistics, missing data, and distributions.\n"
            f"2. Analyze unit economics indicators (sales volume, average prices, return rates, CAC/LTV signals).\n"
            f"3. Identify top performing categories, revenue anomalies, or operational bottlenecks.\n"
            f"4. Provide 3-5 concrete, quantitative recommendations backed by the numbers."
        ),
        expected_output=(
            "A quantitative analytical brief detailing:\n"
            "- Dataset health summary (total records, columns, data hygiene)\n"
            "- Descriptive metric analysis and distribution takeaways\n"
            "- Data-backed commercial conclusions for strategic decision making"
        ),
        agent=agent,
    )

def create_report_writing_task(agent: Agent, context_tasks: list[Task], query: str) -> Task:
    return Task(
        description=(
            f"You are the Senior Executive Strategy Report Writer. Synthesize all findings into an exhaustive, "
            f"boardroom-quality, highly detailed executive business report for: '{query}'.\n\n"
            f"Format requirements:\n"
            f"# Executive Business Report: [Authoritative Title Matching User Query]\n\n"
            f"## 1. Executive Summary\n"
            f"- High-level strategic synthesis, core thesis, and primary commercial takeaway.\n\n"
            f"## 2. Multi-Agent Collaboration & Workflow Transparency\n"
            f"Provide a clear table detailing how each agent contributed to this deliverable:\n"
            f"| Agent | Core Responsibility | Key Finding / Contribution |\n"
            f"| Strategic Supervisor | Project Scoping & Governance | [Summary of workflow routing] |\n"
            f"| Market Researcher | Live Intelligence & Verification | [Summary of competitors & search findings] |\n"
            f"| Data Analyst | Quantitative Profiling & Economics | [Summary of metrics/data analysis] |\n"
            f"| Report Writer | Synthesis & Strategic Roadmap | [Executive strategy architecture] |\n"
            f"| Quality Reviewer | Editorial & Fact-Check Audit | [Auditor evaluation & score] |\n\n"
            f"## 3. Market Landscape, Growth Drivers & Consumer Dynamics\n"
            f"- Market valuation, current growth rate, and macroeconomic tailwinds.\n"
            f"- Customer personas, buying behavior, willingness to pay, and regional nuances.\n\n"
            f"## 4. Competitive Intelligence & Benchmarking Matrix\n"
            f"- In-depth Markdown comparison table of top 3-4 real industry players.\n"
            f"- Breakdown of their pricing, value proposition, marketing channels, and vulnerabilities.\n\n"
            f"## 5. Commercial Strategy & Unit Economics Architecture\n"
            f"- Pricing strategy, gross margin targets, CAC reduction tactics, and customer retention mechanisms.\n"
            f"- Channel strategy (D2C website, marketplaces like Amazon/Flipkart/Blinkit, or B2B sales pipeline).\n\n"
            f"## 6. Actionable 30-Day Phased Execution Plan\n"
            f"- Week 1: Foundation, Infrastructure & Competitive Positioning\n"
            f"- Week 2: Acquisition Channels, Product/Catalog Optimization & Go-to-Market\n"
            f"- Week 3: Conversion Rate Optimization, Customer Experience & Operational Readiness\n"
            f"- Week 4: Scaling, Performance Review, CAC/ROAS Tuning & Long-Term Roadmap\n\n"
            f"## 7. Real-World Limitations, Critical Risks & Mitigation Matrix\n"
            f"- Candid analysis of operational friction, supply chain hurdles, return rates, and mitigation tactics.\n\n"
            f"## 8. Verified Sources and Evidence Citations\n"
            f"- Exact URLs and references retrieved during research.\n\n"
            f"CRITICAL: Write an exhaustive, rigorous deliverable with actionable depth. "
            f"Save the complete Markdown report to disk using the save_markdown_report tool."
        ),
        expected_output=(
            "An exhaustive, multi-thousand-word executive business report containing all 8 structured sections, "
            "agent transparency table, competitive benchmarking matrix, and phased 30-day action plan."
        ),
        agent=agent,
        context=context_tasks,
    )

def create_quality_review_task(agent: Agent, report_task: Task, query: str) -> Task:
    return Task(
        description=(
            f"You are the Quality & Fact-Check Auditor. Conduct a thorough audit of the executive report for: '{query}'.\n\n"
            f"Audit Criteria:\n"
            f"1. Completeness: Are all 8 required sections thoroughly developed?\n"
            f"2. Operational Feasibility: Are the strategy and 30-day plan realistic for commercial execution?\n"
            f"3. Market Grounding: Are the competitor benchmarks and market insights accurate?\n"
            f"4. Risk Candor: Are limitations and unit economics risks honestly evaluated?\n"
            f"5. Citation Integrity: Are source citations verified?\n\n"
            f"Deliver a formal Quality Audit Scorecard with numerical scores, strengths, constructive critique, and final Verdict."
        ),
        expected_output=(
            "### Executive Quality Audit Scorecard\n"
            "* Completeness Score: X/10\n"
            "* Factual & Strategic Consistency Score: X/10\n"
            "* Audit Verdict: APPROVED or REVISION_NEEDED\n\n"
            "### Auditor Strategic Commentary\n"
            "- Strategic Strengths\n"
            "- Key Observations & Risk Flags\n"
            "- Final Verdict & Sign-Off"
        ),
        agent=agent,
        context=[report_task],
    )

"""
AgentFlow AI - Minimal Working Multi-Agent Smoke Test (Stage 3)
Demonstrates a Gemini-powered CrewAI agent with environment validation.
"""
import os
import sys
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, LLM

# Ensure UTF-8 output on Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Load environment variables
load_dotenv()

def validate_environment() -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or not api_key.strip():
        print("\n[ERROR] GEMINI_API_KEY is not set in .env!")
        print("Please configure your Gemini API key in the .env file.")
        print("Reference template: .env.example\n")
        sys.exit(1)
    
    model = os.getenv("GEMINI_MODEL", "gemini/gemini-3.5-flash")
    return model

def main():
    model_name = validate_environment()
    print(f"[*] Initializing AgentFlow AI with model: {model_name}")

    llm = LLM(
        model=model_name,
        temperature=0.2,
    )

    researcher = Agent(
        role="Business Research Analyst",
        goal="Explain business topics in clear, fact-checked, and actionable language",
        backstory=(
            "You are a seasoned business research analyst at AgentFlow AI. "
            "You distinguish verified facts from assumptions and provide practical insights."
        ),
        llm=llm,
        verbose=True,
        allow_delegation=False,
    )

    research_task = Task(
        description=(
            "Explain how small Indian businesses can use AI automation. "
            "Provide 3 practical examples and outline one real-world limitation "
            "for each example. Do not invent statistics or fake citations."
        ),
        expected_output=(
            "A structured report containing 3 practical business automation examples "
            "with actionable implementation points and noted limitations."
        ),
        agent=researcher,
    )

    crew = Crew(
        agents=[researcher],
        tasks=[research_task],
        verbose=True,
    )

    print("[*] Starting Crew execution...")
    result = crew.kickoff()

    print("\n==============================")
    print("   AGENTFLOW AI RESULT")
    print("==============================\n")
    print(result)

if __name__ == "__main__":
    main()

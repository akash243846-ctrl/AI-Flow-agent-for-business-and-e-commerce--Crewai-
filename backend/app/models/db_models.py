"""
AgentFlow AI - SQLAlchemy Database Models
Stores Task state, timeline events, and human approval decisions.
"""
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Text, Integer, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database.session import Base

class TaskRecord(Base):
    __tablename__ = "tasks"

    id = Column(String(36), primary_key=True, index=True)
    query = Column(Text, nullable=False)
    status = Column(String(30), default="QUEUED", index=True) # QUEUED, RUNNING, COMPLETED, FAILED, AWAITING_APPROVAL
    
    csv_filename = Column(String(255), nullable=True)
    csv_path = Column(String(500), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    elapsed_seconds = Column(Float, nullable=True)
    
    report_markdown = Column(Text, nullable=True)
    quality_scorecard = Column(Text, nullable=True)
    research_summary = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Human-in-the-Loop Governance
    approval_status = Column(String(20), default="NONE") # NONE, PENDING, APPROVED, REJECTED
    approval_notes = Column(Text, nullable=True)
    approved_at = Column(DateTime, nullable=True)

    events = relationship("AgentExecutionEvent", back_populates="task", cascade="all, delete-orphan")

class AgentExecutionEvent(Base):
    __tablename__ = "agent_execution_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    task_id = Column(String(36), ForeignKey("tasks.id"), nullable=False, index=True)
    agent_name = Column(String(100), nullable=False)
    event_type = Column(String(50), nullable=False) # STARTED, THINKING, TOOL_USE, COMPLETED, ERROR
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    task = relationship("TaskRecord", back_populates="events")

"""
AgentFlow AI - Pydantic Request & Response Schemas
Provides strict type validation and OpenAPI documentation.
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class TaskCreateRequest(BaseModel):
    query: str = Field(
        ...,
        min_length=5,
        max_length=2000,
        description="Business research, market analysis, or automation request.",
        examples=["Research the Indian kidswear e-commerce market, analyze the data, and create a 30-day marketing plan."]
    )
    dataset_name: Optional[str] = Field(None, description="Optional uploaded dataset reference.")

class TaskApprovalRequest(BaseModel):
    approved: bool = Field(..., description="Whether human reviewer approves next action.")
    notes: Optional[str] = Field(None, max_length=500, description="Feedback or reason for approval decision.")

class AgentEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    task_id: str
    agent_name: str
    event_type: str
    message: str
    timestamp: datetime

class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    query: str
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    elapsed_seconds: Optional[float] = None
    csv_filename: Optional[str] = None
    approval_status: str
    error_message: Optional[str] = None

class TaskDetailResponse(TaskResponse):
    model_config = ConfigDict(from_attributes=True)

    report_markdown: Optional[str] = None
    quality_scorecard: Optional[str] = None
    research_summary: Optional[str] = None
    events: List[AgentEventResponse] = []

class HealthResponse(BaseModel):
    status: str
    version: str
    gemini_model: str
    database: str

"""
AgentFlow AI - FastAPI API Endpoints
RESTful routes for health checks, task dispatching, polling, report download, and approvals.
"""
from typing import List, Optional
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Response
from fastapi.responses import PlainTextResponse, FileResponse
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.db_models import TaskRecord
from backend.app.schemas.tasks import (
    HealthResponse,
    TaskResponse,
    TaskDetailResponse,
    TaskApprovalRequest
)
from backend.app.services.task_service import TaskService
from backend.app.core.config import settings

router = APIRouter()

@router.get("/health", response_model=HealthResponse, tags=["System"])
def health_check():
    """System health check and runtime configuration status."""
    return HealthResponse(
        status="healthy",
        version=settings.VERSION,
        gemini_model=settings.GEMINI_MODEL,
        database="SQLite (PostgreSQL-ready)"
    )

@router.post("/api/tasks", response_model=TaskResponse, status_code=202, tags=["Tasks"])
async def create_task_endpoint(
    query: str = Form(..., description="Business research or automation instruction."),
    dataset: Optional[UploadFile] = File(None, description="Optional CSV dataset for quantitative profiling."),
    db: Session = Depends(get_db)
):
    """
    Submits a new business research & automation task.
    Supports optional CSV dataset upload for quantitative data analysis.
    Executes asynchronously with background status tracking.
    """
    if len(query.strip()) < 5:
        raise HTTPException(status_code=400, detail="Query must be at least 5 characters.")

    csv_filename = None
    csv_path = None

    if dataset:
        if not dataset.filename.lower().endswith((".csv", ".tsv")):
            raise HTTPException(status_code=400, detail="Only .csv and .tsv datasets are supported.")
        
        # Save uploaded dataset safely into outputs/
        safe_filename = f"upload_{dataset.filename}"
        saved_file_path = settings.OUTPUTS_DIR / safe_filename
        content = await dataset.read()
        
        # Size limit: 10MB
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Uploaded file exceeds 10MB limit.")
            
        with open(saved_file_path, "wb") as f:
            f.write(content)
            
        csv_filename = dataset.filename
        csv_path = str(saved_file_path)

    # 1. Create DB Task record
    record = TaskService.create_task(
        db=db,
        query=query.strip(),
        csv_filename=csv_filename,
        csv_path=csv_path
    )

    # 2. Dispatch worker thread
    TaskService.run_task_async(
        task_id=record.id,
        query=record.query,
        csv_path=csv_path
    )

    return record

@router.get("/api/tasks", response_model=List[TaskResponse], tags=["Tasks"])
def list_tasks_endpoint(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Lists historical and active business automation tasks."""
    return db.query(TaskRecord).order_by(TaskRecord.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/api/tasks/{task_id}", response_model=TaskDetailResponse, tags=["Tasks"])
def get_task_details_endpoint(task_id: str, db: Session = Depends(get_db)):
    """Retrieves full task details, execution timeline, review scorecard, and report."""
    record = db.query(TaskRecord).filter(TaskRecord.id == task_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Task not found.")
    return record

@router.get("/api/tasks/{task_id}/report", response_class=PlainTextResponse, tags=["Reports"])
def get_task_report_markdown(task_id: str, db: Session = Depends(get_db)):
    """Returns the generated report formatted in raw Markdown."""
    record = db.query(TaskRecord).filter(TaskRecord.id == task_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Task not found.")
    if not record.report_markdown:
        raise HTTPException(status_code=400, detail="Report has not been generated yet.")
    
    return PlainTextResponse(
        content=record.report_markdown,
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="agentflow_report_{task_id[:8]}.md"'}
    )

@router.post("/api/tasks/{task_id}/approve", response_model=TaskResponse, tags=["Human-in-the-Loop"])
def approve_task_endpoint(
    task_id: str,
    payload: TaskApprovalRequest,
    db: Session = Depends(get_db)
):
    """
    Submits human approval decision for report publication or downstream action.
    Enforces human-in-the-loop governance.
    """
    record = TaskService.set_approval(db, task_id, payload.approved, payload.notes)
    if not record:
        raise HTTPException(status_code=404, detail="Task not found.")
    return record


@router.get("/api/download-project-zip", tags=["System"])
def download_project_zip():
    """Downloads the complete sanitized AgentFlow AI codebase as a ZIP archive."""
    zip_path = settings.BASE_DIR_PATH / "agentflow-ai.zip"
    if not zip_path.exists():
        raise HTTPException(status_code=404, detail="ZIP archive not found.")
    return FileResponse(
        path=str(zip_path),
        media_type="application/zip",
        filename="agentflow-ai.zip"
    )

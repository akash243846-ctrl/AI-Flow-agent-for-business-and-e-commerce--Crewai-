"""
AgentFlow AI - Task Execution Service
Handles asynchronous multi-agent task execution, state transitions, and database updates.
"""
import uuid
import threading
from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from backend.app.database.session import SessionLocal
from backend.app.models.db_models import TaskRecord, AgentExecutionEvent
from backend.app.crew.workflow import run_agentflow_crew
import logging

logger = logging.getLogger("agentflow.services.task")

class TaskService:
    @staticmethod
    def create_task(db: Session, query: str, csv_filename: Optional[str] = None, csv_path: Optional[str] = None) -> TaskRecord:
        task_id = str(uuid.uuid4())
        record = TaskRecord(
            id=task_id,
            query=query,
            status="QUEUED",
            csv_filename=csv_filename,
            csv_path=csv_path,
            created_at=datetime.utcnow(),
            approval_status="NONE",
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        
        # Log initial event
        TaskService._log_event(db, task_id, "System", "STARTED", f"Task registered with ID: {task_id}")
        return record

    @staticmethod
    def _log_event(db: Session, task_id: str, agent_name: str, event_type: str, message: str):
        try:
            event = AgentExecutionEvent(
                task_id=task_id,
                agent_name=agent_name,
                event_type=event_type,
                message=message,
                timestamp=datetime.utcnow()
            )
            db.add(event)
            db.commit()
        except Exception as e:
            logger.error(f"Failed to log event for task {task_id}: {e}")

    @staticmethod
    def run_task_async(task_id: str, query: str, csv_path: Optional[str] = None):
        """Dispatches the crew execution in an asynchronous worker thread."""
        thread = threading.Thread(
            target=TaskService._execute_crew_worker,
            args=(task_id, query, csv_path),
            daemon=True
        )
        thread.start()

    @staticmethod
    def _execute_crew_worker(task_id: str, query: str, csv_path: Optional[str] = None):
        """Worker thread entry point."""
        db = SessionLocal()
        try:
            # 1. Update status to RUNNING
            record = db.query(TaskRecord).filter(TaskRecord.id == task_id).first()
            if not record:
                logger.error(f"Task {task_id} not found in worker thread.")
                return

            record.status = "RUNNING"
            db.commit()
            TaskService._log_event(db, task_id, "Supervisor", "STARTED", "Strategic Supervisor initialized workflow.")

            # 2. Run Crew Workflow
            result = run_agentflow_crew(query=query, csv_path=csv_path)

            # 3. Update Record with Success Results
            record = db.query(TaskRecord).filter(TaskRecord.id == task_id).first()
            record.status = "COMPLETED"
            record.completed_at = datetime.utcnow()
            record.elapsed_seconds = result.get("elapsed_seconds")
            record.report_markdown = result.get("final_report")
            record.quality_scorecard = result.get("quality_review")
            record.research_summary = result.get("research_summary")
            record.approval_status = "PENDING"  # Ready for human review
            db.commit()

            TaskService._log_event(
                db, task_id, "Reviewer", "COMPLETED",
                f"Quality Review completed with scorecard. Total duration: {result.get('elapsed_seconds')}s"
            )
            logger.info(f"Task {task_id} completed successfully.")

        except Exception as e:
            logger.exception(f"Error executing crew for task {task_id}: {e}")
            record = db.query(TaskRecord).filter(TaskRecord.id == task_id).first()
            if record:
                record.status = "FAILED"
                record.completed_at = datetime.utcnow()
                record.error_message = str(e)
                db.commit()
                TaskService._log_event(db, task_id, "System", "ERROR", f"Task execution failed: {str(e)}")
        finally:
            db.close()

    @staticmethod
    def set_approval(db: Session, task_id: str, approved: bool, notes: Optional[str] = None) -> Optional[TaskRecord]:
        record = db.query(TaskRecord).filter(TaskRecord.id == task_id).first()
        if not record:
            return None
            
        record.approval_status = "APPROVED" if approved else "REJECTED"
        record.approval_notes = notes
        record.approved_at = datetime.utcnow()
        db.commit()
        db.refresh(record)
        
        status_label = "APPROVED" if approved else "REJECTED"
        TaskService._log_event(db, task_id, "Human Reviewer", "APPROVAL", f"Human marked report as {status_label}. Notes: {notes or 'None'}")
        return record

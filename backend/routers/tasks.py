from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..auth import get_current_user
from datetime import date
from .. import models, schemas

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

def require_member(db, project_id, user_id):
    m = db.query(models.ProjectMember).filter_by(
        project_id=project_id, user_id=user_id).first()
    if not m:
        raise HTTPException(403, "Not a project member")
    return m

def require_admin(db, project_id, user_id):
    member = require_member(db, project_id, user_id)
    if member.role != "admin":
        raise HTTPException(403, "Admin access required")
    return member

def ensure_assignee_is_project_member(db, project_id, assigned_to):
    if assigned_to is None:
        return
    assignee = db.query(models.ProjectMember).filter_by(
        project_id=project_id, user_id=assigned_to).first()
    if not assignee:
        raise HTTPException(400, "Assignee must be a project member")

@router.get("/dashboard", response_model=schemas.DashboardOut)
def dashboard(db: Session = Depends(get_db), user=Depends(get_current_user)):
    tasks = db.query(models.Task).filter_by(assigned_to=user.id).all()
    today = date.today()
    return {
        "todo":        sum(1 for t in tasks if t.status == "todo"),
        "in_progress": sum(1 for t in tasks if t.status == "in_progress"),
        "done":        sum(1 for t in tasks if t.status == "done"),
        "overdue":     sum(1 for t in tasks
                           if t.due_date and t.due_date < today and t.status != "done"),
    }

@router.post("/", response_model=schemas.TaskOut)
def create_task(body: schemas.TaskCreate, db: Session = Depends(get_db),
                user=Depends(get_current_user)):
    require_admin(db, body.project_id, user.id)
    ensure_assignee_is_project_member(db, body.project_id, body.assigned_to)
    task = models.Task(**body.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    out = schemas.TaskOut.model_validate(task)
    out.assignee_name = task.assignee.name if task.assignee else None
    return out

@router.get("/", response_model=list[schemas.TaskOut])
def get_tasks(project_id: int, db: Session = Depends(get_db),
              user=Depends(get_current_user)):
    require_member(db, project_id, user.id)
    tasks = db.query(models.Task).filter_by(project_id=project_id).all()
    results = []
    for t in tasks:
        out = schemas.TaskOut.model_validate(t)
        out.assignee_name = t.assignee.name if t.assignee else None
        results.append(out)
    return results

@router.patch("/{id}", response_model=schemas.TaskOut)
def update_task(id: int, body: schemas.TaskUpdate, db: Session = Depends(get_db),
                user=Depends(get_current_user)):
    task = db.query(models.Task).filter_by(id=id).first()
    if not task:
        raise HTTPException(404, "Task not found")
    require_member(db, task.project_id, user.id)
    changes = body.model_dump(exclude_unset=True)
    if "assigned_to" in changes:
        ensure_assignee_is_project_member(db, task.project_id, changes["assigned_to"])
    for field, value in changes.items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    out = schemas.TaskOut.model_validate(task)
    out.assignee_name = task.assignee.name if task.assignee else None
    return out

@router.delete("/{id}")
def delete_task(id: int, db: Session = Depends(get_db),
                user=Depends(get_current_user)):
    task = db.query(models.Task).filter_by(id=id).first()
    if not task:
        raise HTTPException(404, "Task not found")
    m = require_member(db, task.project_id, user.id)
    if m.role != "admin":
        raise HTTPException(403, "Admin access required")
    db.delete(task)
    db.commit()
    return {"message": "Task deleted"}

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..auth import get_current_user
from .. import models, schemas

router = APIRouter(prefix="/api/projects", tags=["projects"])

def get_member(db, project_id, user_id):
    return db.query(models.ProjectMember).filter_by(
        project_id=project_id, user_id=user_id).first()

def require_admin(db, project_id, user_id):
    m = get_member(db, project_id, user_id)
    if not m:
        raise HTTPException(403, "Not a project member")
    if m.role != "admin":
        raise HTTPException(403, "Admin access required")
    return m

def require_member(db, project_id, user_id):
    m = get_member(db, project_id, user_id)
    if not m:
        raise HTTPException(403, "Not a project member")
    return m

@router.post("/", response_model=schemas.ProjectOut)
def create_project(body: schemas.ProjectCreate, db: Session = Depends(get_db),
                   user=Depends(get_current_user)):
    project = models.Project(name=body.name, description=body.description, owner_id=user.id)
    db.add(project)
    db.commit()
    db.refresh(project)
    db.add(models.ProjectMember(project_id=project.id, user_id=user.id, role="admin"))
    db.commit()
    result = schemas.ProjectOut.model_validate(project)
    result.my_role = "admin"
    return result

@router.get("/", response_model=list[schemas.ProjectOut])
def get_projects(db: Session = Depends(get_db), user=Depends(get_current_user)):
    members = db.query(models.ProjectMember).filter_by(user_id=user.id).all()
    results = []
    for m in members:
        p = schemas.ProjectOut.model_validate(m.project)
        p.my_role = m.role
        results.append(p)
    return results

@router.get("/{id}", response_model=schemas.ProjectOut)
def get_project(id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    require_member(db, id, user.id)
    project = db.query(models.Project).filter_by(id=id).first()
    if not project:
        raise HTTPException(404, "Project not found")
    m = get_member(db, id, user.id)
    result = schemas.ProjectOut.model_validate(project)
    result.my_role = m.role
    return result

@router.get("/{id}/members", response_model=list[schemas.MemberOut])
def get_members(id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    require_member(db, id, user.id)
    members = db.query(models.ProjectMember).filter_by(project_id=id).all()
    return [{"id": m.user.id, "name": m.user.name,
             "email": m.user.email, "role": m.role} for m in members]

@router.post("/{id}/members", response_model=schemas.MemberOut)
def add_member(id: int, body: schemas.MemberAdd, db: Session = Depends(get_db),
               user=Depends(get_current_user)):
    require_admin(db, id, user.id)
    project = db.query(models.Project).filter_by(id=id).first()
    if not project:
        raise HTTPException(404, "Project not found")
    target = db.query(models.User).filter_by(email=body.email).first()
    if not target:
        raise HTTPException(404, "User not found")
    existing = get_member(db, id, target.id)
    if existing:
        existing.role = body.role
    else:
        db.add(models.ProjectMember(project_id=id, user_id=target.id, role=body.role))
    db.commit()
    return {"id": target.id, "name": target.name, "email": target.email, "role": body.role}

@router.delete("/{id}/members/{user_id}")
def remove_member(id: int, user_id: int, db: Session = Depends(get_db),
                  user=Depends(get_current_user)):
    require_admin(db, id, user.id)
    if user_id == user.id:
        raise HTTPException(400, "Cannot remove yourself")
    m = get_member(db, id, user_id)
    if not m:
        raise HTTPException(404, "Member not found")
    db.delete(m)
    db.commit()
    return {"message": "Member removed"}

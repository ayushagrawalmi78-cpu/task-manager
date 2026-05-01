from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Date, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"
    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String(100), nullable=False)
    email         = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())

    memberships   = relationship("ProjectMember", back_populates="user")
    tasks         = relationship("Task", back_populates="assignee")


class Project(Base):
    __tablename__ = "projects"
    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String(100), nullable=False)
    description = Column(Text)
    owner_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    members     = relationship("ProjectMember", back_populates="project")
    tasks       = relationship("Task", back_populates="project")


class ProjectMember(Base):
    __tablename__  = "project_members"
    id             = Column(Integer, primary_key=True, index=True)
    project_id     = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"))
    user_id        = Column(Integer, ForeignKey("users.id",    ondelete="CASCADE"))
    role           = Column(String(20), default="member")

    __table_args__ = (UniqueConstraint("project_id", "user_id"),)

    project        = relationship("Project", back_populates="members")
    user           = relationship("User",    back_populates="memberships")


class Task(Base):
    __tablename__ = "tasks"
    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String(200), nullable=False)
    description = Column(Text)
    project_id  = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"))
    assigned_to = Column(Integer, ForeignKey("users.id",    ondelete="SET NULL"), nullable=True)
    status      = Column(String(20), default="todo")
    due_date    = Column(Date, nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    project     = relationship("Project", back_populates="tasks")
    assignee    = relationship("User",    back_populates="tasks")

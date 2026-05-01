from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=72)


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr

    model_config = {"from_attributes": True}


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


class ProjectCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    description: Optional[str] = Field(default=None, max_length=1000)


class ProjectOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    owner_id: int
    created_at: datetime
    my_role: Optional[str] = None

    model_config = {"from_attributes": True}


class MemberAdd(BaseModel):
    email: EmailStr
    role: Literal["admin", "member"] = "member"


class MemberOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

    model_config = {"from_attributes": True}


class TaskCreate(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    project_id: int
    assigned_to: Optional[int] = None
    due_date: Optional[date] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=2, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    status: Optional[Literal["todo", "in_progress", "done"]] = None
    assigned_to: Optional[int] = None
    due_date: Optional[date] = None


class TaskOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    project_id: int
    assigned_to: Optional[int]
    assignee_name: Optional[str] = None
    status: str
    due_date: Optional[date]
    created_at: datetime

    model_config = {"from_attributes": True}


class DashboardOut(BaseModel):
    todo: int
    in_progress: int
    done: int
    overdue: int

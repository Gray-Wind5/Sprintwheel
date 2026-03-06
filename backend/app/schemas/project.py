from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID
from enum import Enum


class ProjectRole(str, Enum):
    product_owner = "Product Owner"
    scrum_facilitator = "Scrum Facilitator"
    developer = "Developer"


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    sprint_duration: int = Field(default=7)


class ProjectUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    sprint_duration: int = Field(default=7)


class ProjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    sprint_duration: int
    project_velocity: float


class ProjectListItemOut(BaseModel):
    id: UUID
    name: str
    sprint_duration: int
    project_velocity: float
    role: ProjectRole


class JoinProjectIn(BaseModel):
    role: ProjectRole


class ProjectMembershipOut(BaseModel):
    project_id: UUID
    role: ProjectRole


class UpdateRoleIn(BaseModel):
    role: ProjectRole


class UpdateRoleOut(BaseModel):
    status: str
    project_id: UUID
    user_id: str
    role: ProjectRole
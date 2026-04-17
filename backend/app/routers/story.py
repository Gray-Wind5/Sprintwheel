from datetime import date
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.project import Project
from app.models.project_members import ProjectMember
from app.models.sprint import Sprint
from app.models.story import Story
from app.models.user import User
from app.schemas.story import (
    StoryCreate,
    StoryUpdate,
    StoryOut,
    StoryReorderRequest,
    StoryPointsUpdate,
    StoryDateUpdate,
)

router = APIRouter(prefix="/stories", tags=["stories"])


def require_project_member(db: Session, project_id: UUID, user_id: str) -> None:
    pm = (
        db.query(ProjectMember)
        .filter(ProjectMember.project_id == project_id, ProjectMember.user_id == user_id)
        .first()
    )
    if not pm:
        raise HTTPException(status_code=404, detail="Project not found")


def recalculate_sprint_velocity(db: Session, sprint_id: UUID) -> None:
    sprint = db.query(Sprint).filter(Sprint.id == sprint_id).first()
    if not sprint:
        return

    velocity = (
        db.query(func.coalesce(func.sum(Story.points), 0))
        .filter(Story.sprint_id == sprint_id, Story.isDone == True)
        .scalar()
    )

    sprint.sprint_velocity = int(velocity or 0)


@router.post("", response_model=StoryOut)
def create_story(
    data: StoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_project_member(db, data.project_id, current_user.id)

    project = db.query(Project).filter(Project.id == data.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if data.sprint_id is not None:
        sprint = db.query(Sprint).filter(Sprint.id == data.sprint_id).first()
        if not sprint:
            raise HTTPException(status_code=404, detail="Sprint not found")
        if str(sprint.project_id) != str(data.project_id):
            raise HTTPException(status_code=400, detail="Sprint does not belong to project")

    story = Story(
        project_id=data.project_id,
        sprint_id=data.sprint_id,
        title=data.title,
        description=data.description,
        points=data.points,
        isDone=False,
        priority=data.priority,
        date_added=date.today() if data.sprint_id is not None else None,
        date_completed=None,
    )
    db.add(story)

    if data.sprint_id is not None:
        recalculate_sprint_velocity(db, data.sprint_id)

    db.commit()
    db.refresh(story)
    return story


@router.post("/backlog", response_model=StoryOut)
def create_backlog_story(
    data: StoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == data.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    require_project_member(db, data.project_id, current_user.id)

    if data.sprint_id is not None:
        raise HTTPException(
            status_code=400,
            detail="Backlog stories cannot be assigned to a sprint",
        )

    max_priority = (
      db.query(Story.priority)
      .filter(Story.project_id == data.project_id, Story.sprint_id.is_(None))
      .order_by(Story.priority.desc())
      .first()
    )
    next_priority = max_priority[0] + 1 if max_priority else 1

    story = Story(
        project_id=data.project_id,
        sprint_id=None,
        title=data.title,
        description=data.description,
        points=data.points,
        priority=next_priority,
        isDone=False,
        date_added=None,
        date_completed=None,
    )

    db.add(story)
    db.commit()
    db.refresh(story)
    return story


@router.get("", response_model=list[StoryOut])
def list_stories(
    project_id: UUID | None = None,
    sprint_id: UUID | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not project_id:
        raise HTTPException(status_code=400, detail="project_id is required")

    require_project_member(db, project_id, current_user.id)

    q = db.query(Story).filter(Story.project_id == project_id)
    if sprint_id is not None:
        q = q.filter(Story.sprint_id == sprint_id)

    return q.order_by(Story.priority.desc()).all()


@router.get("/backlog", response_model=list[StoryOut])
def get_product_backlog(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_project_member(db, project_id, current_user.id)

    return (
        db.query(Story)
        .filter(Story.project_id == project_id, Story.sprint_id.is_(None))
        .order_by(Story.priority.desc())
        .all()
    )


@router.put("/backlog/reorder")
def reorder_backlog(
    data: StoryReorderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stories = (
        db.query(Story)
        .filter(Story.id.in_(data.ordered_ids), Story.sprint_id.is_(None))
        .all()
    )

    if len(stories) != len(data.ordered_ids):
        raise HTTPException(status_code=400, detail="Invalid story IDs")

    project_ids = {story.project_id for story in stories}
    if len(project_ids) != 1:
        raise HTTPException(status_code=400, detail="All backlog stories must belong to the same project")

    require_project_member(db, list(project_ids)[0], current_user.id)

    story_map = {story.id: story for story in stories}
    for index, story_id in enumerate(data.ordered_ids):
        story_map[story_id].priority = len(data.ordered_ids) - index

    db.commit()
    return {"status": "success"}


@router.get("/{story_id}", response_model=StoryOut)
def get_story(
    story_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    require_project_member(db, story.project_id, current_user.id)
    return story


@router.patch("/{story_id}", response_model=StoryOut)
def update_story(
    story_id: UUID,
    data: StoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    require_project_member(db, story.project_id, current_user.id)

    update_payload = data.model_dump(exclude_unset=True)
    old_sprint_id = story.sprint_id

    if "sprint_id" in update_payload and update_payload["sprint_id"] is not None:
        sprint = db.query(Sprint).filter(Sprint.id == update_payload["sprint_id"]).first()
        if not sprint:
            raise HTTPException(status_code=404, detail="Sprint not found")
        if str(sprint.project_id) != str(story.project_id):
            raise HTTPException(status_code=400, detail="Sprint does not belong to story's project")

    for key, value in update_payload.items():
        setattr(story, key, value)

    # newly assigned to sprint
    if old_sprint_id is None and story.sprint_id is not None:
        if "date_added" not in update_payload or story.date_added is None:
            story.date_added = date.today()
        story.date_completed = None
        story.isDone = False

    # removed from sprint
    if old_sprint_id is not None and story.sprint_id is None:
        story.date_added = None
        story.date_completed = None
        story.isDone = False

    # if marked incomplete, clear completion date
    if "isDone" in update_payload and update_payload["isDone"] is False:
        story.date_completed = None

    # if marked complete but no completion date came in, set today
    if "isDone" in update_payload and update_payload["isDone"] is True and story.date_completed is None:
        story.date_completed = date.today()

    # keep isDone consistent with date_completed if date_completed was sent
    if "date_completed" in update_payload:
        story.isDone = story.date_completed is not None

    affected_sprint_ids = set()
    if old_sprint_id is not None:
        affected_sprint_ids.add(old_sprint_id)
    if story.sprint_id is not None:
        affected_sprint_ids.add(story.sprint_id)

    if any(key in update_payload for key in ["points", "sprint_id", "isDone", "date_completed"]):
        for sid in affected_sprint_ids:
            recalculate_sprint_velocity(db, sid)

    db.commit()
    db.refresh(story)
    return story


@router.post("/{story_id}/assign-sprint/{sprint_id}", response_model=StoryOut)
def assign_story_to_sprint(
    story_id: UUID,
    sprint_id: UUID,
    payload: Optional[dict] = Body(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    require_project_member(db, story.project_id, current_user.id)

    sprint = db.query(Sprint).filter(Sprint.id == sprint_id).first()
    if not sprint:
        raise HTTPException(status_code=404, detail="Sprint not found")

    if str(sprint.project_id) != str(story.project_id):
        raise HTTPException(status_code=400, detail="Sprint does not belong to story's project")

    date_added_value = None
    if payload and payload.get("date_added"):
        try:
            date_added_value = date.fromisoformat(payload["date_added"])
        except Exception:
            raise HTTPException(status_code=400, detail="date_added must be YYYY-MM-DD")

    old_sprint_id = story.sprint_id

    story.sprint_id = sprint_id
    story.date_added = date_added_value or date.today()
    story.date_completed = None
    story.isDone = False

    if old_sprint_id is not None:
        recalculate_sprint_velocity(db, old_sprint_id)
    recalculate_sprint_velocity(db, sprint_id)

    db.commit()
    db.refresh(story)
    return story


@router.post("/{story_id}/unassign-sprint", response_model=StoryOut)
def unassign_story_from_sprint(
    story_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    require_project_member(db, story.project_id, current_user.id)

    old_sprint_id = story.sprint_id
    story.sprint_id = None
    story.date_added = None
    story.date_completed = None
    story.isDone = False

    if old_sprint_id is not None:
        recalculate_sprint_velocity(db, old_sprint_id)

    db.commit()
    db.refresh(story)
    return story


@router.post("/{story_id}/toggle-done", response_model=StoryOut)
def toggle_story_done(
    story_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    require_project_member(db, story.project_id, current_user.id)

    sprint_id = story.sprint_id

    if story.isDone:
        story.isDone = False
        story.date_completed = None
    else:
        story.isDone = True
        story.date_completed = date.today()

    if sprint_id is not None:
        recalculate_sprint_velocity(db, sprint_id)

    db.commit()
    db.refresh(story)
    return story


@router.patch("/{story_id}/points", response_model=StoryOut)
def update_story_points(
    story_id: UUID,
    data: StoryPointsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    require_project_member(db, story.project_id, current_user.id)

    story.points = data.points

    if story.sprint_id is not None:
        recalculate_sprint_velocity(db, story.sprint_id)

    db.commit()
    db.refresh(story)
    return story


@router.patch("/{story_id}/date", response_model=StoryOut)
def update_story_date_completed(
    story_id: UUID,
    data: StoryDateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    require_project_member(db, story.project_id, current_user.id)

    story.date_completed = data.date_completed
    story.isDone = data.date_completed is not None

    if story.sprint_id is not None:
        recalculate_sprint_velocity(db, story.sprint_id)

    db.commit()
    db.refresh(story)
    return story


@router.delete("/{story_id}")
def delete_story(
    story_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    require_project_member(db, story.project_id, current_user.id)
    old_sprint_id = story.sprint_id

    db.delete(story)

    if old_sprint_id is not None:
        recalculate_sprint_velocity(db, old_sprint_id)

    db.commit()
    return {"status": "ok"}
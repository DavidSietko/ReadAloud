from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.user import (
    UserResponse,
    ReadingProgressResponse,
    SaveProgressRequest,
    SessionResponse,
    SessionMessageResponse,
    SaveMessageRequest,
)
from app.services.auth import get_current_user
from app.models.models import User, ReadingProgress, ReadingSession, SessionMessage
from app.database import get_db

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/progress/{book_id}", response_model=ReadingProgressResponse | None)
async def get_progress(
    book_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ReadingProgress).where(
            ReadingProgress.user_id == current_user.id,
            ReadingProgress.gutenberg_id == book_id,
        )
    )
    return result.scalar_one_or_none()


@router.put("/progress/{book_id}", response_model=ReadingProgressResponse)
async def save_progress(
    book_id: int,
    data: SaveProgressRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ReadingProgress).where(
            ReadingProgress.user_id == current_user.id,
            ReadingProgress.gutenberg_id == book_id,
        )
    )
    progress = result.scalar_one_or_none()
    if progress:
        progress.current_chunk = data.current_chunk
        progress.progress = data.progress
        progress.last_read_at = datetime.utcnow()
    else:
        progress = ReadingProgress(
            user_id=current_user.id,
            gutenberg_id=book_id,
            current_chunk=data.current_chunk,
            progress=data.progress,
        )
        db.add(progress)
    await db.commit()
    await db.refresh(progress)
    return progress


@router.get("/sessions/{book_id}", response_model=SessionResponse)
async def get_or_create_session(
    book_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ReadingSession)
        .where(
            ReadingSession.user_id == current_user.id,
            ReadingSession.gutenberg_id == book_id,
        )
        .options(selectinload(ReadingSession.messages))
        .order_by(ReadingSession.created_at.desc())
        .limit(1)
    )
    session = result.scalar_one_or_none()
    if not session:
        session = ReadingSession(user_id=current_user.id, gutenberg_id=book_id)
        db.add(session)
        await db.commit()
        await db.execute(
            select(ReadingSession).where(ReadingSession.id == session.id)
        )
        await db.refresh(session)
        session.messages = []
    return session


@router.post("/sessions/{book_id}/messages", response_model=SessionMessageResponse)
async def save_session_message(
    book_id: int,
    data: SaveMessageRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ReadingSession)
        .where(
            ReadingSession.user_id == current_user.id,
            ReadingSession.gutenberg_id == book_id,
        )
        .order_by(ReadingSession.created_at.desc())
        .limit(1)
    )
    session = result.scalar_one_or_none()
    if not session:
        session = ReadingSession(user_id=current_user.id, gutenberg_id=book_id)
        db.add(session)
        await db.flush()

    msg = SessionMessage(session_id=session.id, role=data.role, content=data.content)
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return msg

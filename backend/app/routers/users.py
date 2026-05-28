from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.user import UserResponse, ReadingProgressResponse, SaveProgressRequest
from app.services.auth import get_current_user
from app.models.models import User, ReadingProgress
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

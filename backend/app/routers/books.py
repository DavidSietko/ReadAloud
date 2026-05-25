from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.book import BookSearchResponse, BookResponse
from app.services.gutenberg import GutenbergService
from app.services.auth import get_current_user
from app.models.models import User

router = APIRouter(prefix="/books", tags=["books"])
gutenberg = GutenbergService()


@router.get("/search", response_model=BookSearchResponse)
async def search_books(
    q: str | None = Query(None, description="Search by title or author"),
    topic: str | None = Query(None, description="Filter by subject/topic"),
    language: str = Query("en", description="ISO language code"),
    page: int = Query(1, ge=1),
):
    return await gutenberg.search(query=q, topic=topic, language=language, page=page)


@router.get("/{book_id}", response_model=BookResponse)
async def get_book(book_id: int):
    book = await gutenberg.get_book(book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


@router.get("/{book_id}/text")
async def get_book_text(
    book_id: int,
    chunk: int = Query(0, ge=0, description="Chunk index (each chunk ~32k chars)"),
    current_user: User = Depends(get_current_user),
):
    """Return one text chunk of a book for the AI reader context."""
    content = await gutenberg.get_book_text(book_id, chunk=chunk)
    if content is None:
        raise HTTPException(status_code=404, detail="Book text not available for this chunk")
    total = await gutenberg.get_chunk_count(book_id)
    return {"book_id": book_id, "chunk": chunk, "total_chunks": total, "content": content}

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.services.auth import get_current_user
from app.services.claude import ClaudeService
from app.models.models import User

router = APIRouter(prefix="/ai", tags=["ai"])
claude = ClaudeService()


class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    book_id: int
    message: str
    book_context: str  # current text chunk being read
    history: list[ChatMessage] = []


@router.post("/chat")
async def chat(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
):
    """Stream an AI companion response as Server-Sent Events."""
    return StreamingResponse(
        claude.stream_response(
            user_message=req.message,
            book_context=req.book_context,
            history=[m.model_dump() for m in req.history],
        ),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )

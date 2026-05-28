from datetime import datetime
from pydantic import BaseModel


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    avatar_url: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class ReadingProgressResponse(BaseModel):
    gutenberg_id: int
    current_chunk: int
    progress: float
    last_read_at: datetime

    model_config = {"from_attributes": True}


class SaveProgressRequest(BaseModel):
    current_chunk: int
    progress: float


class SessionMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime
    model_config = {"from_attributes": True}


class SessionResponse(BaseModel):
    id: int
    gutenberg_id: int
    created_at: datetime
    messages: list[SessionMessageResponse] = []
    model_config = {"from_attributes": True}


class SaveMessageRequest(BaseModel):
    role: str
    content: str

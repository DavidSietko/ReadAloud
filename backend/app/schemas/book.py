from pydantic import BaseModel


class BookAuthor(BaseModel):
    name: str
    birth_year: int | None = None
    death_year: int | None = None


class BookFormat(BaseModel):
    epub: str | None = None
    text: str | None = None
    html: str | None = None


class BookResponse(BaseModel):
    id: int
    title: str
    authors: list[BookAuthor]
    subjects: list[str]
    languages: list[str]
    download_count: int | None = None
    cover_url: str | None = None
    formats: BookFormat


class BookSearchResponse(BaseModel):
    count: int
    next: str | None
    previous: str | None
    results: list[BookResponse]


class ReadingProgressResponse(BaseModel):
    gutenberg_id: int
    progress: float
    last_read_at: str

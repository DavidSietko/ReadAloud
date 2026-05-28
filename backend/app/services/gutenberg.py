import re
import httpx
from bs4 import BeautifulSoup
from fastapi import HTTPException
from app.schemas.book import BookResponse, BookSearchResponse, BookAuthor, BookFormat
from app.config import settings

CHUNK_SIZE = 32_000  # ~8k tokens per chunk for AI context

_PG_START = re.compile(r"\*\*\* ?START OF (THIS|THE) PROJECT GUTENBERG", re.IGNORECASE)
_PG_END = re.compile(r"\*\*\* ?END OF (THIS|THE) PROJECT GUTENBERG", re.IGNORECASE)


def _make_client() -> httpx.AsyncClient:
    return httpx.AsyncClient(base_url=settings.gutendex_base, timeout=15.0)


class GutenbergService:
    def _parse_book(self, data: dict) -> BookResponse:
        formats = data.get("formats", {})
        return BookResponse(
            id=data["id"],
            title=data["title"],
            authors=[BookAuthor(**a) for a in data.get("authors", [])],
            subjects=data.get("subjects", []),
            languages=data.get("languages", []),
            download_count=data.get("download_count"),
            cover_url=formats.get("image/jpeg"),
            formats=BookFormat(
                epub=formats.get("application/epub+zip"),
                text=formats.get("text/plain; charset=utf-8")
                or formats.get("text/plain"),
                html=formats.get("text/html; charset=utf-8")
                or formats.get("text/html"),
            ),
        )

    @staticmethod
    def _parse_html_to_text(html: str) -> str:
        soup = BeautifulSoup(html, "lxml")

        for tag in soup(["script", "style", "head"]):
            tag.decompose()

        for tag in soup.find_all(True, {"class": re.compile(r"pg-(header|footer)", re.I)}):
            tag.decompose()
        for tag_id in ("pg-header", "pg-footer", "pg-header-heading", "pg-machine-header"):
            el = soup.find(id=tag_id)
            if el:
                el.decompose()

        blocks: list[str] = []
        for el in soup.find_all(["h1", "h2", "h3", "h4", "p", "pre"]):
            if el.name in ("h1", "h2", "h3", "h4"):
                text = el.get_text(" ", strip=True)
                if text:
                    blocks.append(f"{'#' * int(el.name[1])} {text}")
            elif el.name == "pre":
                text = el.get_text()
                if text.strip():
                    blocks.append(text.strip())
            else:
                text = el.get_text(" ", strip=True)
                if text:
                    blocks.append(text)

        return "\n\n".join(blocks)

    @staticmethod
    def _strip_gutenberg_markers(text: str) -> str:
        start_match = _PG_START.search(text)
        end_match = _PG_END.search(text)
        if start_match:
            text = text[start_match.end():]
        if end_match:
            text = text[: _PG_END.search(text).start()] if _PG_END.search(text) else text
        return text.strip()

    async def _fetch_clean_text(self, book: BookResponse) -> str | None:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            # Prefer HTML for structured output
            if book.formats.html:
                try:
                    resp = await client.get(book.formats.html)
                    if resp.status_code == 200:
                        return self._parse_html_to_text(resp.text)
                except httpx.HTTPError:
                    pass

            # Fall back to plain text with marker stripping
            if book.formats.text:
                try:
                    resp = await client.get(book.formats.text)
                    if resp.status_code == 200:
                        return self._strip_gutenberg_markers(resp.text)
                except httpx.HTTPError:
                    pass

        return None

    async def search(
        self,
        query: str | None = None,
        topic: str | None = None,
        language: str = "en",
        page: int = 1,
    ) -> BookSearchResponse:
        params: dict = {"languages": language, "page": page}
        if query:
            params["search"] = query
        if topic:
            params["topic"] = topic

        try:
            async with _make_client() as client:
                resp = await client.get("/books/", params=params)
                resp.raise_for_status()
                data = resp.json()
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="Book service timed out")
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=502, detail=f"Book service error: {e.response.status_code}")
        except httpx.HTTPError:
            raise HTTPException(status_code=502, detail="Book service unavailable")

        return BookSearchResponse(
            count=data["count"],
            next=data.get("next"),
            previous=data.get("previous"),
            results=[self._parse_book(b) for b in data["results"]],
        )

    async def get_book(self, book_id: int) -> BookResponse | None:
        try:
            async with _make_client() as client:
                resp = await client.get(f"/books/{book_id}/")
                if resp.status_code == 404:
                    return None
                resp.raise_for_status()
                return self._parse_book(resp.json())
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="Book service timed out")
        except httpx.HTTPError:
            raise HTTPException(status_code=502, detail="Book service unavailable")

    async def get_book_text(self, book_id: int, chunk: int = 0) -> str | None:
        book = await self.get_book(book_id)
        if not book or (not book.formats.html and not book.formats.text):
            return None

        text = await self._fetch_clean_text(book)
        if not text:
            return None

        chunks = [text[i: i + CHUNK_SIZE] for i in range(0, len(text), CHUNK_SIZE)]
        if chunk >= len(chunks):
            return None
        return chunks[chunk]

    async def get_chunk_count(self, book_id: int) -> int | None:
        book = await self.get_book(book_id)
        if not book or (not book.formats.html and not book.formats.text):
            return None

        text = await self._fetch_clean_text(book)
        if not text:
            return None
        return max(1, len(text) // CHUNK_SIZE + 1)

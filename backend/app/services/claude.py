from typing import AsyncGenerator
import anthropic
from app.config import settings

SYSTEM_PROMPT = """\
You are a warm, engaging reading companion for the ReadAloud app.

Your role:
- Read and narrate the provided book text naturally and expressively
- Answer questions about the book, characters, themes, or context
- Offer to explain difficult words, historical context, or literary devices
- Be conversational and encouraging

When the user asks you to read, narrate the next passage from <book_context> in a natural \
storytelling voice. When answering questions, be concise and insightful.\
"""


class ClaudeService:
    def __init__(self):
        self._client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

    async def stream_response(
        self,
        user_message: str,
        book_context: str,
        history: list[dict],
    ) -> AsyncGenerator[str, None]:
        messages = [*history, {"role": "user", "content": user_message}]
        system = [
            {"type": "text", "text": SYSTEM_PROMPT},
            {
                "type": "text",
                "text": f"<book_context>\n{book_context}\n</book_context>",
                "cache_control": {"type": "ephemeral"},
            },
        ]

        async with self._client.messages.stream(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            system=system,
            messages=messages,
        ) as stream:
            async for text in stream.text_stream:
                yield f"data: {text}\n\n"
        yield "data: [DONE]\n\n"

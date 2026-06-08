import os
import logging
import requests

from google import genai

logger = logging.getLogger(__name__)

AI_UNAVAILABLE_MESSAGE = (
    "I'm having trouble reaching the AI service right now. "
    "Please try again in a moment."
)


def _openrouter_fallback(prompt: str, model_name: str, label: str) -> str | None:
    """Return OpenRouter text for a specific model, or None if it fails."""
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        logger.error("%s unavailable because OPENROUTER_API_KEY is missing.", label)
        return None

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": os.getenv("APP_PUBLIC_URL", "http://localhost:5173"),
                "X-Title": "Harshith Portfolio Assistant",
            },
            json={
                "model": model_name,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=30,
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()
    except Exception:
        logger.exception("%s failed.", label)
        return None


class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model_name = "gemini-2.5-flash"
        self.client = None

        if self.api_key:
            try:
                self.client = genai.Client(api_key=self.api_key)
            except Exception:
                self.client = None

    def get_response(self, prompt: str) -> str:
        # Try Gemini first
        if self.client:
            try:
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                )
                if response and response.text:
                    return response.text.strip()
            except Exception:
                logger.exception("Gemini request failed; falling back to OpenRouter.")

        haiku_model = os.getenv("OPENROUTER_MODEL", "anthropic/claude-haiku-4.5")
        haiku_reply = _openrouter_fallback(
            prompt,
            model_name=haiku_model,
            label=f"OpenRouter fallback model {haiku_model}",
        )
        if haiku_reply:
            return haiku_reply

        free_reply = _openrouter_fallback(
            prompt,
            model_name="openrouter/free",
            label="OpenRouter free fallback",
        )
        if free_reply:
            return free_reply

        return AI_UNAVAILABLE_MESSAGE


if __name__ == "__main__":
    service = GeminiService()
    print(service.get_response("Say hello in one short sentence."))

import os
import requests

from google import genai


def _openrouter_fallback(prompt: str) -> str:
    """Fallback to OpenRouter if Gemini is unavailable."""
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        return "Error: Both Gemini and OpenRouter API keys are unavailable."

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "google/gemini-2.0-flash-exp:free",
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=30,
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()
    except Exception as e:
        return f"Error communicating with OpenRouter: {str(e)}"


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
                pass  # Fall through to OpenRouter

        # Fallback to OpenRouter
        return _openrouter_fallback(prompt)


if __name__ == "__main__":
    service = GeminiService()
    print(service.get_response("Say hello in one short sentence."))

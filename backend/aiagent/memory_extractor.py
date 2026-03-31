import json
import re
from aiagent.gemini import GeminiService
from aiagent.prompts import MEMORY_EXTRACTION_PROMPT


class MemoryExtractionService:

    @staticmethod
    def extract(user_message: str) -> dict:
        prompt = MEMORY_EXTRACTION_PROMPT.replace(
            "{user_message}", user_message
        )

        prompt += """
You MUST respond with VALID JSON only.
Do NOT include markdown or explanations.
"""

        service = GeminiService()
        raw = service.get_response(prompt)

        print("RAW MEMORY LLM OUTPUT:", raw)

        # 🔥 Strip markdown code fences if present
        cleaned = re.sub(r"^```json|```$", "", raw.strip(), flags=re.MULTILINE).strip()

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            return {"s": 0}

import os
from openai import OpenAI


class OpenAIService:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")

        self.client = OpenAI(api_key=api_key)

    def get_response(self, user_message: str) -> str:
        """
        Send a message to OpenAI and return the response text
        """
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "user", "content": user_message}
                ],
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            return f"Error communicating with OpenAI: {str(e)}"

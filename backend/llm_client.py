import os
import json
from typing import List

from dotenv import load_dotenv
from groq import Groq

from models import AutocompleteRequest, QueryOption, Message

load_dotenv()

api_key = os.environ.get("GROQ_API_KEY")
if not api_key:
    raise RuntimeError("GROQ_API_KEY is not set")

client = Groq(api_key=api_key)


def _flatten_message_content(content) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for part in content:
            if part.get("type") == "text" and "text" in part:
                parts.append(part["text"])
        return "\n".join(parts)
    return ""


def _build_messages(req: AutocompleteRequest) -> list[dict]:
    system_content = (
        "You are an expert SQL assistant. "
        "Given a database schema, a natural language question, and an optional conversation history, "
        "you generate 2–3 high quality SQL query suggestions. "
        "Return ONLY valid JSON with the structure: "
        "{ \"options\": [ { \"description\": \"...\", \"sqlQuery\": \"SELECT ...\" }, ... ] }"
    )

    messages = [{"role": "system", "content": system_content}]

    for m in req.conversationHistory:
        text = _flatten_message_content(m.content)
        if not text:
            continue
        role = m.role if m.role in ("system", "user", "assistant") else "user"
        messages.append({"role": role, "content": text})

    messages.append({
        "role": "user",
        "content": (
            f"Schema:\n{req.schemaDescription}\n\n"
            f"User question:\n{req.userInput}\n\n"
            "Return the JSON now."
        ),
    })

    return messages


async def generate_query_options(req: AutocompleteRequest) -> List[QueryOption]:
    messages = _build_messages(req)

    try:
        chat_completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            response_format={"type": "json_object"},
        )
    except Exception as e:
        print("Error calling LLM:", repr(e))
        return []

    content = chat_completion.choices[0].message.content

    try:
        data = json.loads(content)
    except json.JSONDecodeError:
        print("Invalid JSON from LLM:", content)
        return []

    raw_options = data.get("options", [])
    options: List[QueryOption] = []

    for item in raw_options:
        if not isinstance(item, dict):
            continue

        description = item.get("description")
        sql_query = item.get("sqlQuery") or item.get("sql") or item.get("sql_query")

        if description and sql_query:
            options.append(QueryOption(description=description, sqlQuery=sql_query))

    # return ONLY the list (this is critical)
    return options

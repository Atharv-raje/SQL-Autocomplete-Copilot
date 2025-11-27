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
    """
    We keep this to support any future multi-part messages.
    Right now your conversationHistory is empty, but this is ready for later.
    """
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for part in content:
            t = part.get("type")
            if t == "text" and "text" in part:
                parts.append(part["text"])
        return "\n".join(parts)
    return ""


def _build_messages(req: AutocompleteRequest) -> list[dict]:
    system_content = (
        "You are an expert SQL autocomplete assistant.\n"
        "The user is typing a natural language question about a SQL schema.\n\n"
        "You must return JSON ONLY in this exact shape:\n"
        "{\n"
        '  \"options\": [\n'
        '    { \"completionText\": \"completed question...\", \"sqlQuery\": \"SELECT ...\" },\n'
        "    ... up to 3 options\n"
        "  ]\n"
        "}\n\n"
        "Rules:\n"
        "1) completionText MUST be a natural language continuation of the userInput.\n"
        "   It should feel like autocomplete: take what the user typed and finish the sentence.\n"
        "2) sqlQuery MUST be a valid SQL query for the given schema.\n"
        "3) Do not add explanations or any extra fields outside the JSON object.\n"
    )

    messages: list[dict] = [
        {"role": "system", "content": system_content}
    ]

    # Include any conversation history (future-proofing)
    for m in req.conversationHistory:
        content_text = _flatten_message_content(m.content)
        if not content_text:
            continue
        role = m.role
        if role not in ("system", "user", "assistant"):
            role = "user"
        messages.append({"role": role, "content": content_text})

    user_content = (
        "Here is the database schema:\n"
        f"{req.schemaDescription}\n\n"
        "The user has partially typed this question:\n"
        f"\"{req.userInput}\"\n\n"
        "Now output ONLY the JSON object with autocomplete options as specified."
    )

    messages.append({"role": "user", "content": user_content})
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
        print("Could not parse JSON from LLM:", content)
        return []

    raw_options = data.get("options", [])
    options: List[QueryOption] = []

    for item in raw_options:
        if not isinstance(item, dict):
            continue
        completion = item.get("completionText") or item.get("description")
        sql = item.get("sqlQuery") or item.get("sql_query") or item.get("sql")
        if completion and sql:
            options.append(QueryOption(completionText=completion, sqlQuery=sql))

    # IMPORTANT: return just the list of QueryOption
    return options

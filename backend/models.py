from typing import List, Literal, Any
from pydantic import BaseModel


class Message(BaseModel):
    role: Literal["system", "user", "assistant"]
    # We keep this flexible so we can pass through whatever the LLM might send
    content: Any


class AutocompleteRequest(BaseModel):
    userInput: str
    schemaDescription: str
    conversationHistory: List[Message] = []


class QueryOption(BaseModel):
    # Completed natural-language question to show in dropdown / card
    completionText: str
    # Final SQL query
    sqlQuery: str


class AutocompleteResponse(BaseModel):
    options: List[QueryOption]

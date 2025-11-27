from typing import List

from models import AutocompleteRequest, QueryOption
from llm_client import generate_query_options


async def autocomplete(request: AutocompleteRequest) -> List[QueryOption]:
    """
    Thin service layer. Returns a list of QueryOption objects.
    """
    options = await generate_query_options(request)
    return options

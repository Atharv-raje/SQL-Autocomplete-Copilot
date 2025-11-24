from models import AutocompleteRequest, QueryOption
from llm_client import generate_query_options


async def autocomplete(req: AutocompleteRequest) -> list[QueryOption]:
    """
    Returns only a list of QueryOption.
    main.py will wrap it into AutocompleteResponse.
    """
    return await generate_query_options(req)

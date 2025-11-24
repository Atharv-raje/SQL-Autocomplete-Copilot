from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models import AutocompleteRequest, AutocompleteResponse
from autocomplete import autocomplete as autocomplete_service

app = FastAPI(
    title="SQL Autocomplete API",
    version="1.0.0",
)

# CORS: allow frontend + local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",
        "http://localhost:3000",
        "https://quill-sql-autocomplete.vercel.app",
        "https://quill-sql-autocomplete.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {"status": "ok", "message": "SQL autocomplete backend is running"}


@app.post("/autocomplete", response_model=AutocompleteResponse)
async def autocomplete_endpoint(req: AutocompleteRequest):
    # autocomplete_service returns a list[QueryOption], not a Response
    options = await autocomplete_service(req)
    return AutocompleteResponse(options=options)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models import AutocompleteRequest, AutocompleteResponse
from autocomplete import autocomplete as autocomplete_service

app = FastAPI(
    title="SQL Autocomplete API",
    version="1.0.0",
)

# CORS: allow both local dev and deployed frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",                       # local dev
        "https://quill-sql-autocomplete.vercel.app",  # frontend on Vercel
        "https://quill-sql-autocomplete.onrender.com",
        "*",  # keep permissive for the take-home
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
    options = await autocomplete_service(req)
    # Wrap the list in the response model
    return AutocompleteResponse(options=options)

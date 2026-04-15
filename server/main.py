from typing import Any

import httpx
import uvicorn
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    discogs_token: str
    discogs_username: str
    discogs_base_url: str = "https://api.discogs.com"
    cors_origins: str = "http://localhost:5173"
    port: int = 8000

    @property
    def origins(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    class Config:
        env_file = ".env"


settings = Settings()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["*"],
)

SORT_PARAMS = {"sort": "artist", "sort_order": "asc"}


class Pagination(BaseModel):
    page: int
    pages: int
    per_page: int
    items: int


class RecordsResponse(BaseModel):
    releases: list[Any]
    pagination: Pagination



async def _discogs_get(path: str, *, params: dict[str, Any] | None = None) -> Any:
    headers = {
        "Authorization": f"Discogs token={settings.discogs_token}",
        "Accept": "application/vnd.discogs.v2+json",
    }
    async with httpx.AsyncClient(
        base_url=settings.discogs_base_url,
        headers=headers,
        timeout=30,
    ) as client:
        resp = await client.get(path, params=params)
        if resp.status_code >= 400:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()


async def _paginate(path: str, key: str, per_page: int) -> tuple[list, dict]:
    """Fetch all pages for a given Discogs endpoint and return (items, pagination)."""
    first = await _discogs_get(path, params={"page": 1, "per_page": per_page, **SORT_PARAMS})
    items = list(first.get(key, []) or [])
    pages = int((first.get("pagination", {}) or {}).get("pages", 1))

    for page in range(2, pages + 1):
        nxt = await _discogs_get(path, params={"page": page, "per_page": per_page, **SORT_PARAMS})
        items.extend(nxt.get(key, []) or [])

    return items, first.get("pagination", {})


@app.get("/api/health")
async def health():
    return {"ok": True}


@app.get("/collection", response_model=RecordsResponse)
async def collection_folder_releases(
    folder_id: int = Query(0, ge=0),
    per_page: int = Query(100, ge=1, le=100),
):
    """ Fetch the collection for the authenticated user. """
    path = f"/users/{settings.discogs_username}/collection/folders/{folder_id}/releases"
    releases, pagination = await _paginate(path, key="releases", per_page=per_page)
    return RecordsResponse(releases=releases, pagination=pagination)


@app.get("/wantlist", response_model=RecordsResponse)
async def wantlist(
    per_page: int = Query(100, ge=1, le=100),
):
    """ Fetch the wantlist for the authenticated user. """
    path = f"/users/{settings.discogs_username}/wants"
    wants, pagination = await _paginate(path, key="wants", per_page=per_page)
    return RecordsResponse(releases=wants, pagination=pagination)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=settings.port)

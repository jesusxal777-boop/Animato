"""FastAPI backend for 3d-anim-ai-maker.

Run it with:
    uv run fastapi dev main.py
    uv run fastapi run main.py
"""

import contextlib
import os
from collections.abc import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.config import PUBLIC_DIR, STATIC_MOUNT
from app.mcp_server import mcp, mcp_app
from app.routers import animation, chat, files, health, prompt, run, upload

INDEX_FILE = os.path.join(PUBLIC_DIR, "index.html")


@contextlib.asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    async with mcp.session_manager.run():
        yield


app = FastAPI(title="3d-anim-ai-maker", lifespan=lifespan)

origins = [
    "http://localhost:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(STATIC_MOUNT, StaticFiles(directory=PUBLIC_DIR), name="public")
app.mount("/mcp", mcp_app)

app.include_router(health.router)
app.include_router(upload.router)
app.include_router(files.router)
app.include_router(prompt.router)
app.include_router(run.router)
app.include_router(chat.router)
app.include_router(animation.router)


@app.get("/")
async def serve_index() -> FileResponse:
    return FileResponse(INDEX_FILE)


@app.get("/{full_path:path}")
async def serve_spa(full_path: str) -> FileResponse:
    candidate = os.path.normpath(os.path.join(PUBLIC_DIR, full_path))

    if (
        full_path
        and os.path.commonpath([PUBLIC_DIR, candidate]) == PUBLIC_DIR
        and os.path.isfile(candidate)
    ):
        return FileResponse(candidate)

    return FileResponse(INDEX_FILE)

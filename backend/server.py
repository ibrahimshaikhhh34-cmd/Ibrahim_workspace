from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import io
import re
import base64
import zipfile
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone

import numpy as np
import trimesh

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="SC2 Mod Command Center")
api_router = APIRouter(prefix="/api")

ProjectType = Literal["Creature", "Weapon", "Block", "Item"]
ProjectStatus = Literal["Idea", "Model Made", "Textured", "In-Game Tested", "Done"]


class Project(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: ProjectType
    status: ProjectStatus
    notes: str = ""
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ProjectIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    type: ProjectType
    status: ProjectStatus
    notes: str = ""


@api_router.get("/")
async def root():
    return {"message": "SC2 Mod Command Center API"}


@api_router.get("/projects", response_model=List[Project])
async def list_projects():
    docs = await db.projects.find({}, {"_id": 0}).sort("updated_at", -1).to_list(2000)
    return docs


@api_router.post("/projects", response_model=Project, status_code=201)
async def create_project(body: ProjectIn):
    project = Project(**body.model_dump())
    await db.projects.insert_one(project.model_dump())
    return project


@api_router.put("/projects/{project_id}", response_model=Project)
async def update_project(project_id: str, body: ProjectIn):
    update = body.model_dump()
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.projects.find_one_and_update(
        {"id": project_id}, {"$set": update}, projection={"_id": 0}, return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Project not found")
    return result


@api_router.delete("/projects/{project_id}", status_code=204)
async def delete_project(project_id: str):
    result = await db.projects.delete_one({"id": project_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return None


# ---------------- Model Prep ----------------

FACING_VECTORS = {
    "+X": [1, 0, 0], "-X": [-1, 0, 0],
    "+Y": [0, 1, 0], "-Y": [0, -1, 0],
    "+Z": [0, 0, 1], "-Z": [0, 0, -1],
}
CATEGORY_FOLDER = {"Creature": "Creatures", "Item": "Items", "Block": "Blocks"}


def load_mesh(data: bytes, ext: str) -> trimesh.Trimesh:
    loaded = trimesh.load(io.BytesIO(data), file_type=ext.lstrip("."), force="mesh")
    if not isinstance(loaded, trimesh.Trimesh) or len(loaded.faces) == 0:
        raise HTTPException(status_code=400, detail="Could not read any triangle geometry from this file")
    return loaded


async def read_model_upload(file: UploadFile) -> trimesh.Trimesh:
    ext = Path(file.filename or "").suffix.lower()
    if ext not in (".glb", ".obj", ".gltf"):
        raise HTTPException(status_code=400, detail="Only .glb, .gltf or .obj files are supported")
    data = await file.read()
    try:
        return load_mesh(data, ext)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Failed to parse model: {exc}")


def mesh_info(mesh: trimesh.Trimesh) -> dict:
    ext = mesh.bounding_box.extents
    has_uv = mesh.visual.kind == "texture" and getattr(mesh.visual, "uv", None) is not None and len(mesh.visual.uv) > 0
    return {
        "vertices": int(len(mesh.vertices)),
        "faces": int(len(mesh.faces)),
        "extents": [float(x) for x in ext],
        "has_uv": bool(has_uv),
        "has_embedded_texture": extract_embedded_texture(mesh) is not None,
    }


def extract_embedded_texture(mesh: trimesh.Trimesh) -> Optional[bytes]:
    try:
        mat = mesh.visual.material
    except Exception:
        return None
    img = getattr(mat, "baseColorTexture", None) or getattr(mat, "image", None)
    if img is None:
        return None
    buf = io.BytesIO()
    img.convert("RGBA").save(buf, format="PNG")
    return buf.getvalue()


def transform_mesh(mesh: trimesh.Trimesh, facing: str, target_length: float, mode: str) -> trimesh.Trimesh:
    m = mesh.copy()
    src = np.array(FACING_VECTORS[facing], dtype=float)
    dst = np.array([0, 0, 1], dtype=float)
    if not np.allclose(src, dst):
        m.apply_transform(trimesh.geometry.align_vectors(src, dst))

    extents = m.bounding_box.extents
    longest = float(max(extents)) or 1.0
    scale = (1.0 if mode == "Block" else target_length) / longest
    m.apply_scale(scale)

    bounds = m.bounds
    center = (bounds[0] + bounds[1]) / 2.0
    if mode == "Weapon":
        offset = np.array([-center[0], -center[1], -bounds[0][2]])
    else:
        offset = -center
    m.apply_translation(offset)
    return m


def build_dae(mesh: trimesh.Trimesh, texture_name: str) -> bytes:
    raw = trimesh.exchange.dae.export_collada(mesh).decode("utf-8")
    if "<up_axis>" in raw:
        raw = re.sub(r"<up_axis>[^<]*</up_axis>", "<up_axis>Y_UP</up_axis>", raw)
    else:
        raw = raw.replace("</asset>", "<up_axis>Y_UP</up_axis></asset>", 1)
    raw = re.sub(r"<init_from>[^<]*\.(png|jpg|jpeg)</init_from>", f"<init_from>{texture_name}</init_from>", raw)
    return raw.encode("utf-8")


@api_router.post("/model/inspect")
async def inspect_model(file: UploadFile = File(...)):
    mesh = await read_model_upload(file)
    return {"filename": file.filename, **mesh_info(mesh)}


@api_router.post("/model/export")
async def export_model(
    file: UploadFile = File(...),
    name: str = Form(...),
    mode: Literal["Weapon", "Block", "Item"] = Form(...),
    category: Literal["Creature", "Item", "Block"] = Form(...),
    facing: str = Form("+Z"),
    target_length: float = Form(1.0),
    texture: Optional[UploadFile] = File(None),
    icon: Optional[str] = Form(None),
):
    if facing not in FACING_VECTORS:
        raise HTTPException(status_code=400, detail="Invalid facing direction")
    safe_name = re.sub(r"[^A-Za-z0-9_\-]", "", name.strip()) or "Model"

    mesh = await read_model_upload(file)
    texture_bytes = await texture.read() if texture is not None else extract_embedded_texture(mesh)
    processed = transform_mesh(mesh, facing, max(target_length, 0.001), mode)
    dae_bytes = build_dae(processed, f"{safe_name}.png")

    folder = CATEGORY_FOLDER[category]
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr(f"Models/{safe_name}.dae", dae_bytes)
        if texture_bytes:
            zf.writestr(f"Textures/{folder}/{safe_name}.png", texture_bytes)
        if icon and icon.startswith("data:image/png;base64,"):
            zf.writestr(f"Icons/{safe_name}.png", base64.b64decode(icon.split(",", 1)[1]))
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{safe_name}_sc2.zip"'},
    )


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

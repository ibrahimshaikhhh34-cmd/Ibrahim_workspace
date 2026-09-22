"""Backend tests for SC2 Mod Command Center."""
import io
import os
import zipfile
import xml.etree.ElementTree as ET
import pytest
import requests
import trimesh

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/") or \
    open("/app/frontend/.env").read().split("REACT_APP_BACKEND_URL=")[1].split("\n")[0].strip()
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def session():
    return requests.Session()


@pytest.fixture(scope="module")
def box_glb():
    return trimesh.creation.box(extents=[2, 1, 4]).export(file_type="glb")


@pytest.fixture(scope="module")
def box_obj():
    return trimesh.creation.box(extents=[2, 1, 4]).export(file_type="obj").encode()


# ---------- Projects CRUD ----------
class TestProjects:
    created_id = None

    def test_list_projects(self, session):
        r = session.get(f"{API}/projects")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_create_project(self, session):
        payload = {"name": "TEST_FrostWolf", "type": "Creature", "status": "Idea", "notes": "test"}
        r = session.post(f"{API}/projects", json=payload)
        assert r.status_code == 201, r.text
        data = r.json()
        assert data["name"] == payload["name"]
        assert data["type"] == "Creature"
        assert data["status"] == "Idea"
        assert "id" in data and "created_at" in data and "updated_at" in data
        TestProjects.created_id = data["id"]

    def test_create_invalid_type(self, session):
        r = session.post(f"{API}/projects", json={"name": "x", "type": "Bad", "status": "Idea"})
        assert r.status_code == 422

    def test_create_invalid_status(self, session):
        r = session.post(f"{API}/projects", json={"name": "x", "type": "Creature", "status": "Nope"})
        assert r.status_code == 422

    def test_update_project(self, session):
        assert TestProjects.created_id
        r = session.put(f"{API}/projects/{TestProjects.created_id}",
                        json={"name": "TEST_FrostWolf2", "type": "Creature", "status": "Done", "notes": "x"})
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "Done"
        assert data["name"] == "TEST_FrostWolf2"
        # verify persistence
        r2 = session.get(f"{API}/projects")
        found = [p for p in r2.json() if p["id"] == TestProjects.created_id]
        assert found and found[0]["status"] == "Done"

    def test_update_unknown(self, session):
        r = session.put(f"{API}/projects/does-not-exist",
                        json={"name": "x", "type": "Item", "status": "Idea"})
        assert r.status_code == 404

    def test_delete_project(self, session):
        assert TestProjects.created_id
        r = session.delete(f"{API}/projects/{TestProjects.created_id}")
        assert r.status_code == 204

    def test_delete_unknown(self, session):
        r = session.delete(f"{API}/projects/does-not-exist")
        assert r.status_code == 404


# ---------- Model inspect ----------
class TestModelInspect:
    def test_inspect_glb(self, session, box_glb):
        files = {"file": ("box.glb", box_glb, "model/gltf-binary")}
        r = session.post(f"{API}/model/inspect", files=files)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["vertices"] > 0 and d["faces"] == 12
        assert len(d["extents"]) == 3
        assert "has_uv" in d

    def test_inspect_obj(self, session, box_obj):
        files = {"file": ("box.obj", box_obj, "text/plain")}
        r = session.post(f"{API}/model/inspect", files=files)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["faces"] == 12

    def test_inspect_rejects_txt(self, session):
        files = {"file": ("bad.txt", b"nope", "text/plain")}
        r = session.post(f"{API}/model/inspect", files=files)
        assert r.status_code == 400


# ---------- Model export ----------
class TestModelExport:
    def test_export_weapon_with_icon_and_texture(self, session, box_obj):
        # simple 1x1 png
        import base64
        png_1x1 = base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgAAIAAAUAAeImBZsAAAAASUVORK5CYII="
        )
        icon_data_url = "data:image/png;base64," + base64.b64encode(png_1x1).decode()
        files = {
            "file": ("box.obj", box_obj, "text/plain"),
            "texture": ("tex.png", png_1x1, "image/png"),
        }
        data = {
            "name": "TEST_Sword",
            "mode": "Weapon",
            "category": "Item",
            "facing": "+X",
            "target_length": "1.5",
            "icon": icon_data_url,
        }
        r = session.post(f"{API}/model/export", files=files, data=data)
        assert r.status_code == 200, r.text
        assert r.headers["content-type"].startswith("application/zip")
        zf = zipfile.ZipFile(io.BytesIO(r.content))
        names = zf.namelist()
        assert "Models/TEST_Sword.dae" in names
        assert "Textures/Items/TEST_Sword.png" in names
        assert "Icons/TEST_Sword.png" in names
        dae = zf.read("Models/TEST_Sword.dae").decode()
        root = ET.fromstring(dae)  # ensure valid xml
        assert "<up_axis>Y_UP</up_axis>" in dae

    def test_export_block_no_extras(self, session, box_glb):
        files = {"file": ("box.glb", box_glb, "model/gltf-binary")}
        data = {"name": "TEST_Block", "mode": "Block", "category": "Block",
                "facing": "+Z", "target_length": "1.0"}
        r = session.post(f"{API}/model/export", files=files, data=data)
        assert r.status_code == 200, r.text
        zf = zipfile.ZipFile(io.BytesIO(r.content))
        names = zf.namelist()
        assert "Models/TEST_Block.dae" in names
        # no icon => no Icons folder file
        assert not any(n.startswith("Icons/") for n in names)

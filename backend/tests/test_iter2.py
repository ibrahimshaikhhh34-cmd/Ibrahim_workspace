"""Iteration 2 backend tests: gltf/glb export, layout=api, snippets CRUD."""
import io
import json
import os
import zipfile
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
def box_obj():
    with open("/tmp/uvbox.obj", "rb") as f:
        return f.read()


@pytest.fixture(scope="module")
def box_glb():
    return trimesh.creation.box(extents=[1, 1, 1]).export(file_type="glb")


# ---------- Export fmt/layout ----------
class TestExportFmtLayout:
    def test_glb_classic(self, session, box_obj):
        r = session.post(f"{API}/model/export",
                         files={"file": ("uvbox.obj", box_obj, "text/plain")},
                         data={"name": "TEST_Glb", "mode": "Item", "category": "Item",
                               "facing": "+Z", "target_length": "1.0",
                               "fmt": "glb", "layout": "classic"})
        assert r.status_code == 200, r.text
        names = zipfile.ZipFile(io.BytesIO(r.content)).namelist()
        assert "Models/TEST_Glb.glb" in names
        assert not any(n.startswith("Assets/") for n in names)
        assert "modinfo.json" not in names

    def test_gltf_api_creature(self, session, box_obj):
        r = session.post(f"{API}/model/export",
                         files={"file": ("uvbox.obj", box_obj, "text/plain")},
                         data={"name": "TEST_Wolf", "mode": "Item", "category": "Creature",
                               "facing": "+Z", "target_length": "1.0",
                               "fmt": "gltf", "layout": "api"})
        assert r.status_code == 200, r.text
        zf = zipfile.ZipFile(io.BytesIO(r.content))
        names = zf.namelist()
        assert "Assets/Models/TEST_Wolf/TEST_Wolf.gltf" in names
        assert "Assets/Models/TEST_Wolf/TEST_Wolf.bin" in names
        assert "Assets/Animations/TEST_Wolf.json" in names
        assert "modinfo.json" in names
        # gltf JSON refers to sibling .bin
        gltf = json.loads(zf.read("Assets/Models/TEST_Wolf/TEST_Wolf.gltf"))
        assert gltf["buffers"][0]["uri"] == "TEST_Wolf.bin"
        # animation JSON valid, template FourLegged
        anim = json.loads(zf.read("Assets/Animations/TEST_Wolf.json"))
        assert anim["template"] == "FourLegged"
        # modinfo valid, ApiVersion 1.9.1.3
        info = json.loads(zf.read("modinfo.json"))
        assert info["ApiVersion"] == "1.9.1.3"

    def test_dae_classic_regression(self, session, box_glb):
        r = session.post(f"{API}/model/export",
                         files={"file": ("box.glb", box_glb, "model/gltf-binary")},
                         data={"name": "TEST_Dae", "mode": "Item", "category": "Item",
                               "facing": "+Z", "target_length": "1.0",
                               "fmt": "dae", "layout": "classic"})
        assert r.status_code == 200
        names = zipfile.ZipFile(io.BytesIO(r.content)).namelist()
        assert "Models/TEST_Dae.dae" in names

    def test_texture_placed_under_assets_when_api(self, session, box_obj):
        from PIL import Image
        buf = io.BytesIO()
        Image.new("RGBA", (4, 4), (255, 0, 0, 255)).save(buf, format="PNG")
        png = buf.getvalue()
        r = session.post(f"{API}/model/export",
                         files={"file": ("uvbox.obj", box_obj, "text/plain"),
                                "texture": ("t.png", png, "image/png")},
                         data={"name": "TEST_ApiTex", "mode": "Item", "category": "Block",
                               "facing": "+Z", "target_length": "1.0",
                               "fmt": "glb", "layout": "api"})
        assert r.status_code == 200
        names = zipfile.ZipFile(io.BytesIO(r.content)).namelist()
        assert "Assets/Models/TEST_ApiTex.glb" in names
        assert "Assets/Textures/Blocks/TEST_ApiTex.png" in names

    def test_invalid_fmt(self, session, box_obj):
        r = session.post(f"{API}/model/export",
                         files={"file": ("uvbox.obj", box_obj, "text/plain")},
                         data={"name": "x", "mode": "Item", "category": "Item",
                               "facing": "+Z", "target_length": "1.0",
                               "fmt": "stl", "layout": "classic"})
        assert r.status_code == 422


# ---------- Snippets CRUD ----------
class TestSnippets:
    created_id = None

    def test_list(self, session):
        r = session.get(f"{API}/snippets")
        assert r.status_code == 200 and isinstance(r.json(), list)

    def test_create(self, session):
        payload = {"kind": "Recipe", "name": "TEST_Snip", "content": "<Recipe/>"}
        r = session.post(f"{API}/snippets", json=payload)
        assert r.status_code == 201, r.text
        d = r.json()
        assert d["kind"] == "Recipe" and d["name"] == "TEST_Snip"
        assert d["content"] == "<Recipe/>" and "id" in d and "created_at" in d
        TestSnippets.created_id = d["id"]
        # verify persistence
        r2 = session.get(f"{API}/snippets")
        assert any(s["id"] == d["id"] for s in r2.json())

    def test_create_invalid_kind(self, session):
        r = session.post(f"{API}/snippets", json={"kind": "Bad", "name": "x", "content": "y"})
        assert r.status_code == 422

    def test_create_empty_content(self, session):
        r = session.post(f"{API}/snippets", json={"kind": "Block", "name": "x", "content": ""})
        assert r.status_code == 422

    def test_delete(self, session):
        assert TestSnippets.created_id
        r = session.delete(f"{API}/snippets/{TestSnippets.created_id}")
        assert r.status_code == 204
        r2 = session.get(f"{API}/snippets")
        assert not any(s["id"] == TestSnippets.created_id for s in r2.json())

    def test_delete_unknown(self, session):
        r = session.delete(f"{API}/snippets/does-not-exist")
        assert r.status_code == 404

# SC2 Mod Command Center — PRD

## Original problem statement
Build "SC2 Mod Command Center": 4-tab mobile-friendly web app with DB persistence for Survivalcraft 2 modding.
1. Project Tracker (home): CRUD list — name, type (Creature/Weapon/Block/Item), status (Idea/Model Made/Textured/In-Game Tested/Done), notes.
2. Model Prep: upload .glb/.obj, three.js preview, scale to target meters, facing→+Z, pivot centering, Weapon/Block/Item modes, icon PNG snapshot (Block/Item), export Y-up triangulated .dae + texture PNG as .zip in SC2 layout (Models/, Textures/Creatures|Items|Blocks/, Icons/).
3. Log Reader: paste Game.log, group ERROR/Exception lines with counts, plain-English fixes for 4 known patterns, readable fallback.
4. Template Builder: paste one working SC2 XML, derive form from its actual fields only, generate new XML with same structure.
GitHub export requested at the end.

## User choices
- Model export processed server-side (Python/trimesh + pycollada)
- Log/Template parsing client-side
- Dark SC2 game-tool aesthetic; single shared tracker, no login
- Research latest SC2 API if needed (done: survivalcraft.dev — API 1.9 uses Assets/Models with glTF support; legacy .dae still supported; user-specified folder layout kept)

## Architecture
- Backend: FastAPI `/app/backend/server.py` — `/api/projects` CRUD (Mongo, uuid ids), `/api/model/inspect`, `/api/model/export` (stateless multipart, no pod storage).
- Frontend: React (CRA) + Tailwind + shadcn + three.js. Pages in `src/pages/*`, libs in `src/lib/{api,logParser,xmlTemplate}.js`, viewport `src/components/model/ModelViewport.jsx`.

## User personas
- SC2 modder preparing creature/item/block assets and debugging in-game errors on desktop or phone.

## Implemented (2026-06)
- All 4 tabs, default tab = Project Tracker; desktop top tabs + mobile bottom dock.
- Tracker CRUD with search/filters/stats; persisted in MongoDB.
- Model Prep: GLB/OBJ preview, facing rotation, scaling, pivot modes, texture preview, icon capture, zip export (Models/, Textures/<Cat>/, Icons/), DAE forced Y_UP with normals/UVs.
- Log Reader with grouping, counts, 4 known-pattern fixes, raw trace toggle, copy summary, sample log.
- Template Builder with attribute/text-node extraction, grouped form, XML regeneration, copy/download, presets.
- Testing agent iteration 1: backend 100%, frontend 100%.

## Backlog
- P1: per-axis target-length choice (currently longest extent); bulk import/export of tracker as JSON.
- P2: link tracker entries to exported zips; more known log patterns; glTF (Assets/Models) export path for new SC2 API.

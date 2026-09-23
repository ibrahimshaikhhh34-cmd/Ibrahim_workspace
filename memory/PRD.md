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
- Model Prep: GLB/glTF/OBJ preview, facing rotation, scaling, pivot modes, texture preview, icon capture, zip export. Formats: .dae (Y_UP, normals/UVs), .glb, .gltf+.bin. Layouts: Classic Content 2.x (Models/, Textures/<Cat>/, Icons/) or API 1.9 mod (Assets/ prefix + modinfo.json + Assets/Animations/<Name>.json stub for creatures).
- Log Reader with grouping, counts, 4 known-pattern fixes, raw trace toggle, copy summary, sample log.
- Template Builder with attribute/text-node extraction, grouped form, XML regeneration, copy/download, presets.
- Data Builder (tab 5) built from real Content 2.4 files user supplied (/app/reference): Creature (Lion EntityTemplate, all Parameters editable, fresh GUIDs toggle), Block & Item (79-column BlocksData.txt rows from Cobblestone / Chest), Recipe (<Recipe> with 3x3 tap grid). Texture atlas slot picker (16x16, optional Blocks.png preview). Snippet library persisted in Mongo (/api/snippets).
- Testing agent iteration 1 & 2: backend 100%, frontend 100%.

## SC2 research notes
- API 1.9 (survivalcraft.dev): mods = .scmod zip with modinfo.json (Name, Version, ApiVersion 1.9.1.3, ScVersion 1.90.3.0, GameplayImpactLevel, PackageName, Author); Assets/Models (glTF/GLB recommended, .dae still supported), Assets/Animations/*.json (template FourLegged/Human/Bird/Fish, rootBoneRotation, modelScale), Assets/Lang/*.json, *.xdb databases (EntityTemplate inherits via InheritanceParent GUID; Wolf e4275171-…, FourLeggedModel base 76d24f74-…).
- BlocksData.txt: 79 semicolon columns (header row + type row in mod .csv files); mods merge by Class Name.
- Common tooling gaps in community: duplicate GUIDs, InheritanceParent typos, texture slot lookup — addressed by fresh-GUID generator and atlas picker.

## Backlog
- P1: Strings.xml / Lang json builder; Clothes (.clo) builder; per-axis target-length choice; bulk tracker import/export.
- P2: database.xml validator (duplicate GUID / unknown InheritanceParent scan) from a pasted full file; link tracker entries to exported zips; more known log patterns.

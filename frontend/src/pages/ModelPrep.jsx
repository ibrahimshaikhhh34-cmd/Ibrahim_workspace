import { useRef, useState } from "react";
import { Upload, Camera, Package, RotateCcw, Sword, Boxes, Gem, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModelViewport } from "@/components/model/ModelViewport";
import { modelApi } from "@/lib/api";

const MODES = [
  { id: "Weapon", icon: Sword, hint: "Pivot at grip end, blade → +Z" },
  { id: "Block", icon: Boxes, hint: "Snapped to 1×1×1, centered" },
  { id: "Item", icon: Gem, hint: "Centered, no snap" },
];
const MODE_CATEGORY = { Weapon: "Item", Block: "Block", Item: "Item" };
const FACINGS = ["+Z", "-Z", "+X", "-X", "+Y", "-Y"];

export default function ModelPrep() {
  const viewport = useRef(null);
  const [file, setFile] = useState(null);
  const [info, setInfo] = useState(null);
  const [size, setSize] = useState(null);
  const [name, setName] = useState("");
  const [mode, setMode] = useState("Item");
  const [category, setCategory] = useState("Item");
  const [facing, setFacing] = useState("+Z");
  const [targetLength, setTargetLength] = useState("1");
  const [texture, setTexture] = useState(null);
  const [icon, setIcon] = useState(null);
  const [busy, setBusy] = useState(false);

  const settings = { facing, targetLength: Math.max(parseFloat(targetLength) || 1, 0.001), mode };

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setIcon(null);
    setName((n) => n || f.name.replace(/\.[^.]+$/, "").replace(/[^A-Za-z0-9_-]/g, ""));
    try {
      setInfo(await modelApi.inspect(f));
    } catch (err) {
      toast.error(err.response?.data?.detail || "Server could not read this model");
    }
  };

  const pickMode = (m) => { setMode(m); setCategory(MODE_CATEGORY[m]); };

  const snap = () => {
    const url = viewport.current?.snapshot(512);
    if (!url) return toast.error("Load a model first");
    setIcon(url);
    toast.success("Icon captured");
  };

  const exportZip = async () => {
    if (!file) return toast.error("Upload a model first");
    if (!name.trim()) return toast.error("Give the model a name");
    setBusy(true);
    try {
      const blob = await modelApi.exportZip({ file, name, mode, category, facing, targetLength: settings.targetLength, texture, icon });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${name}_sc2.zip`;
      a.click();
      toast.success("ZIP exported");
    } catch (err) {
      const d = err.response?.data;
      toast.error(d instanceof Blob ? await d.text().then((t) => { try { return JSON.parse(t).detail; } catch { return "Export failed"; } }) : "Export failed");
    } finally {
      setBusy(false);
    }
  };

  const fmt = (v) => (v == null ? "–" : v.toFixed(3));

  return (
    <section data-testid="model-prep-page" className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-widest text-[#06B6D4]">Tab 02</p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-wide">Model Prep</h2>
        <p className="text-sm text-[#9CA3AF] mt-2 max-w-2xl">Upload .glb / .obj, orient to +Z, scale to meters, set the pivot, capture an icon and export a Y-up Collada bundle.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="panel tactical-corner relative h-[320px] sm:h-[460px] overflow-hidden">
            <ModelViewport
              ref={viewport}
              file={file}
              textureFile={texture}
              settings={settings}
              onLoaded={(sz) => setSize({ x: sz.x, y: sz.y, z: sz.z })}
              onError={(m) => toast.error(m)}
            />
            {!file && (
              <label data-testid="model-upload-dropzone" className="absolute inset-0 flex flex-col items-center justify-center gap-3 cursor-pointer text-[#9CA3AF] hover:text-[#F3F4F6]">
                <Upload className="h-10 w-10 text-[#F59E0B]" />
                <span className="font-display text-xl uppercase">Tap to upload .glb / .obj</span>
                <input data-testid="model-upload-input" type="file" accept=".glb,.gltf,.obj" className="hidden" onChange={onFile} />
              </label>
            )}
            <div className="absolute top-3 right-3 flex gap-1">
              {["front", "iso", "top", "side"].map((v) => (
                <button key={v} data-testid={`model-view-${v}`} onClick={() => viewport.current?.lookFrom(v)} className="btn-press h-10 px-3 text-[11px] font-mono uppercase bg-[#0B0F17]/80 border border-[#2A364F] rounded-sm text-[#9CA3AF] hover:text-[#F59E0B] hover:border-[#F59E0B]/60 transition-colors">
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[["Verts", info?.vertices], ["Faces", info?.faces], ["UVs", info ? (info.has_uv ? "yes" : "none") : null], ["Size m", size ? `${fmt(size.x)}×${fmt(size.y)}×${fmt(size.z)}` : null]].map(([l, v]) => (
              <div key={l} className="panel p-3">
                <p className="text-[10px] uppercase tracking-widest text-[#6B7280]">{l}</p>
                <p data-testid={`model-stat-${l.toLowerCase().replace(/\s/g, "-")}`} className="font-mono text-sm text-[#F3F4F6] mt-1 truncate">{v ?? "–"}</p>
              </div>
            ))}
          </div>

          {file && (
            <label className="inline-flex items-center gap-2 text-sm text-[#9CA3AF] cursor-pointer hover:text-[#F3F4F6] min-h-[44px]">
              <RotateCcw className="h-4 w-4" /> Replace model
              <input data-testid="model-replace-input" type="file" accept=".glb,.gltf,.obj" className="hidden" onChange={onFile} />
            </label>
          )}
        </div>

        <div className="lg:col-span-2 space-y-5">
          <div className="panel p-5 space-y-5">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-[#9CA3AF]">Asset name</Label>
              <Input data-testid="model-name-input" value={name} onChange={(e) => setName(e.target.value.replace(/[^A-Za-z0-9_-]/g, ""))} placeholder="FrostWolf" className="h-12 bg-[#0B0F17] border-[#2A364F] font-mono" />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-[#9CA3AF]">Mode</Label>
              <div className="grid grid-cols-3 gap-2">
                {MODES.map(({ id, icon: Icon, hint }) => (
                  <button key={id} data-testid={`model-mode-${id.toLowerCase()}`} onClick={() => pickMode(id)} title={hint} className={`btn-press min-h-[64px] rounded-sm border flex flex-col items-center justify-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors ${mode === id ? "border-[#F59E0B] bg-[#F59E0B]/10 text-[#F59E0B]" : "border-[#2A364F] text-[#9CA3AF] hover:border-[#F59E0B]/50 hover:text-[#F3F4F6]"}`}>
                    <Icon className="h-5 w-5" /> {id}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[#6B7280]">{MODES.find((m) => m.id === mode).hint}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-[#9CA3AF]">Model faces</Label>
                <Select value={facing} onValueChange={setFacing}>
                  <SelectTrigger data-testid="model-facing-select" className="h-12 bg-[#0B0F17] border-[#2A364F] font-mono"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#121824]/95 backdrop-blur-xl border-[#2A364F]">
                    {FACINGS.map((f) => <SelectItem key={f} value={f} className="font-mono">{f} → +Z</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest text-[#9CA3AF]">Target length (m)</Label>
                <Input data-testid="model-scale-input" type="number" step="0.05" min="0.01" value={targetLength} disabled={mode === "Block"} onChange={(e) => setTargetLength(e.target.value)} className="h-12 bg-[#0B0F17] border-[#2A364F] font-mono" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-[#9CA3AF]">Texture folder</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger data-testid="model-category-select" className="h-12 bg-[#0B0F17] border-[#2A364F] font-mono"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#121824]/95 backdrop-blur-xl border-[#2A364F]">
                  {["Creature", "Item", "Block"].map((c) => <SelectItem key={c} value={c} className="font-mono">Textures/{c}s</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-[#9CA3AF]">Texture PNG {info?.has_embedded_texture && <span className="text-[#10B981] normal-case tracking-normal">(embedded found, optional)</span>}</Label>
              <label className="flex items-center gap-3 h-12 px-3 rounded-sm border border-dashed border-[#2A364F] cursor-pointer text-sm text-[#9CA3AF] hover:border-[#F59E0B]/60 hover:text-[#F3F4F6] transition-colors">
                <ImageIcon className="h-4 w-4 text-[#F59E0B]" />
                <span data-testid="model-texture-name" className="truncate">{texture ? texture.name : "Choose PNG…"}</span>
                <input data-testid="model-texture-input" type="file" accept="image/png" className="hidden" onChange={(e) => setTexture(e.target.files?.[0] || null)} />
              </label>
            </div>
          </div>

          {mode !== "Weapon" && (
            <div className="panel p-5 space-y-3">
              <Label className="text-xs uppercase tracking-widest text-[#9CA3AF]">Icon snapshot (Icons/{name || "Name"}.png)</Label>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 shrink-0 rounded-sm border border-[#2A364F] bg-[repeating-conic-gradient(#1E2738_0_25%,#121824_0_50%)] bg-[length:16px_16px] flex items-center justify-center overflow-hidden">
                  {icon ? <img data-testid="model-icon-preview" src={icon} alt="icon" className="h-full w-full object-contain" /> : <Camera className="h-6 w-6 text-[#4B5563]" />}
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-xs text-[#6B7280]">Orbit the viewport to the angle you want, then capture a transparent 512px PNG.</p>
                  <Button data-testid="model-snapshot-button" variant="outline" onClick={snap} className="btn-press h-11 w-full border-[#2A364F] bg-transparent text-[#F3F4F6] hover:bg-[#1E2738] hover:text-[#F3F4F6]">
                    <Camera className="h-4 w-4 mr-2" /> Capture icon
                  </Button>
                </div>
              </div>
            </div>
          )}

          <Button data-testid="model-export-zip-button" onClick={exportZip} disabled={busy || !file} className="btn-press w-full h-14 text-base font-semibold uppercase tracking-wider bg-[#F59E0B] text-[#0B0F17] hover:bg-[#D97706] disabled:opacity-50">
            <Package className="h-5 w-5 mr-2" /> {busy ? "Building ZIP…" : "Export SC2 ZIP"}
          </Button>
          <p className="font-mono text-[11px] text-[#6B7280] leading-relaxed">
            Models/{name || "Name"}.dae · Textures/{category}s/{name || "Name"}.png{mode !== "Weapon" ? ` · Icons/${name || "Name"}.png` : ""}
          </p>
        </div>
      </div>
    </section>
  );
}

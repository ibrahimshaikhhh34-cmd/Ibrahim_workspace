import { useState } from "react";
import { Grid3x3, ImagePlus } from "lucide-react";
import { Label } from "@/components/ui/label";

// SC2 Blocks.png atlas is a 16x16 grid; slot = row * 16 + col
export const AtlasPicker = ({ value, onChange }) => {
  const [img, setImg] = useState(null);
  const [open, setOpen] = useState(false);
  const slot = Number(value);
  const valid = Number.isInteger(slot) && slot >= 0 && slot < 256;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-[#9CA3AF]">Texture atlas slot picker</Label>
        <button data-testid="atlas-toggle-button" type="button" onClick={() => setOpen(!open)} className="min-h-[40px] flex items-center gap-1 text-xs uppercase tracking-widest text-[#06B6D4] hover:text-[#F3F4F6]">
          <Grid3x3 className="h-4 w-4" /> {open ? "Hide" : "Show"} grid
        </button>
      </div>
      {open && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs text-[#9CA3AF] cursor-pointer hover:text-[#F3F4F6] min-h-[40px]">
            <ImagePlus className="h-4 w-4 text-[#F59E0B]" /> {img ? "Replace Blocks.png" : "Load your Blocks.png to preview slots"}
            <input data-testid="atlas-image-input" type="file" accept="image/png" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setImg(URL.createObjectURL(f)); }} />
          </label>
          <div
            data-testid="atlas-grid"
            className="relative w-full max-w-[384px] aspect-square border border-[#2A364F] bg-[#080B11] bg-cover"
            style={img ? { backgroundImage: `url(${img})`, imageRendering: "pixelated" } : undefined}
          >
            <div className="absolute inset-0 grid grid-cols-16 grid-rows-16">
              {Array.from({ length: 256 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  data-testid={`atlas-slot-${i}`}
                  title={`Slot ${i} (row ${Math.floor(i / 16)}, col ${i % 16})`}
                  onClick={() => onChange(String(i))}
                  className={`border border-[#2A364F]/40 hover:bg-[#06B6D4]/40 ${valid && slot === i ? "bg-[#F59E0B]/60 ring-2 ring-[#F59E0B] z-10" : ""}`}
                />
              ))}
            </div>
          </div>
          <p className="font-mono text-xs text-[#6B7280]">
            {valid ? `Slot ${slot} → row ${Math.floor(slot / 16)}, col ${slot % 16}` : "Tap a cell to set DefaultTextureSlot"}
          </p>
        </div>
      )}
    </div>
  );
};

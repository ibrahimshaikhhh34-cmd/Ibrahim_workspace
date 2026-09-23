import { useState } from "react";
import { FileCode, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RECIPE_EXAMPLE, buildRecipe } from "@/lib/sc2Data";
import { OutputPanel } from "@/components/data/Shared";

const ATTRS = [
  ["Result", "Result block class (e.g. IronAxeBlock or ArrowBlock:2)"],
  ["ResultCount", "int"], ["RequiredHeatLevel", "int"], ["RequiredPlayerLevel", "int · leave empty to omit"], ["Description", "string"],
];
const LETTERS = ["a", "b", "c"];
const CELL_CYCLE = [" ", "a", "b", "c"];

const gridFromRows = (rows) => Array.from({ length: 3 }, (_, r) => Array.from({ length: 3 }, (_, c) => rows[r]?.[c] ?? " "));

export const RecipeForm = () => {
  const [values, setValues] = useState({ ...RECIPE_EXAMPLE });
  const [grid, setGrid] = useState(() => gridFromRows(RECIPE_EXAMPLE.rows));
  const [output, setOutput] = useState("");
  const set = (k) => (v) => setValues((s) => ({ ...s, [k]: v }));

  const cycle = (r, c) => setGrid((g) => g.map((row, ri) => row.map((cell, ci) => (ri === r && ci === c ? CELL_CYCLE[(CELL_CYCLE.indexOf(cell) + 1) % CELL_CYCLE.length] : cell))));

  const rowsFromGrid = () => {
    const used = grid.map((row) => row.join(""));
    const cols = Math.max(...used.map((r) => r.trimEnd().length), 0);
    const trimmed = used.map((r) => r.slice(0, cols));
    while (trimmed.length && trimmed[trimmed.length - 1].trim() === "") trimmed.pop();
    while (trimmed.length && trimmed[0].trim() === "") trimmed.shift();
    return trimmed;
  };

  const generate = (e) => {
    e.preventDefault();
    if (!values.Result.trim()) return toast.error("Result is required");
    const rows = rowsFromGrid();
    if (!rows.length) return toast.error("Place at least one ingredient in the grid");
    const usedLetters = new Set(rows.join("").replace(/\s/g, ""));
    for (const l of usedLetters) if (!values[l]) return toast.error(`Ingredient "${l}" is used in the grid but has no CraftingId`);
    setOutput(buildRecipe({ ...values, rows }));
  };

  return (
    <div className="space-y-6">
      <form data-testid="recipe-form" onSubmit={generate} className="panel p-4 sm:p-6 space-y-8">
        <fieldset className="space-y-3">
          <legend className="font-display text-base font-semibold uppercase tracking-wide text-[#F59E0B] mb-2">Recipe attributes</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ATTRS.map(([k, hint]) => (
              <div key={k} className={`space-y-1 ${k === "Description" ? "sm:col-span-2" : ""}`}>
                <Label className="text-xs text-[#9CA3AF]">{k} <span className="font-mono text-[10px] text-[#4B5563]">{hint}</span></Label>
                <Input data-testid={`recipe-field-${k}`} value={values[k]} onChange={(e) => set(k)(e.target.value)} className="h-11 bg-[#0B0F17] border-[#2A364F] font-mono text-sm" />
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="font-display text-base font-semibold uppercase tracking-wide text-[#F59E0B] mb-2">Ingredients (CraftingId per letter)</legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {LETTERS.map((l) => (
              <div key={l} className="space-y-1">
                <Label className="text-xs text-[#9CA3AF]">{l} =</Label>
                <Input data-testid={`recipe-ingredient-${l}`} value={values[l]} onChange={(e) => set(l)(e.target.value)} placeholder="e.g. stick" className="h-11 bg-[#0B0F17] border-[#2A364F] font-mono text-sm" />
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="font-display text-base font-semibold uppercase tracking-wide text-[#F59E0B] mb-2">Crafting grid · tap a cell to cycle blank → a → b → c</legend>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div data-testid="recipe-grid" className="grid grid-cols-3 gap-2 w-full max-w-[264px]">
              {grid.map((row, r) => row.map((cell, c) => (
                <button
                  key={`${r}${c}`}
                  type="button"
                  data-testid={`recipe-cell-${r}-${c}`}
                  onClick={() => cycle(r, c)}
                  className={`btn-press aspect-square rounded-sm border font-display text-3xl font-bold transition-colors ${cell === " " ? "border-[#2A364F] bg-[#0B0F17] text-[#2A364F] hover:border-[#F59E0B]/50" : "border-[#F59E0B] bg-[#F59E0B]/10 text-[#F59E0B]"}`}
                >
                  {cell === " " ? "·" : cell}
                </button>
              )))}
            </div>
            <pre className="font-mono text-sm text-[#06B6D4] bg-[#080B11] p-4 rounded border border-[#1E2738] min-w-[140px]">
              {grid.map((row) => `"${row.join("")}"`).join("\n")}
            </pre>
          </div>
        </fieldset>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button data-testid="recipe-generate-button" type="submit" className="btn-press h-12 flex-1 text-base font-semibold uppercase tracking-wider bg-[#06B6D4] text-[#0B0F17] hover:bg-[#0891B2]">
            <FileCode className="h-5 w-5 mr-2" /> Generate Recipe XML
          </Button>
          <Button data-testid="recipe-reset-button" type="button" variant="outline" onClick={() => { setValues({ ...RECIPE_EXAMPLE }); setGrid(gridFromRows(RECIPE_EXAMPLE.rows)); setOutput(""); }} className="btn-press h-12 border-[#2A364F] bg-transparent text-[#F3F4F6] hover:bg-[#1E2738] hover:text-[#F3F4F6]">
            <RotateCcw className="h-4 w-4 mr-2" /> Reset
          </Button>
        </div>
      </form>

      <OutputPanel kind="Recipe" name={values.Result} output={output} fileName="CraftingRecipes.xml" testIdPrefix="recipe" />
    </div>
  );
};

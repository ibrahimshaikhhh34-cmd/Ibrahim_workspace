import { useState } from "react";
import { PawPrint, Boxes, Gem, Hammer } from "lucide-react";
import { CreatureForm } from "@/components/data/CreatureForm";
import { BlockForm } from "@/components/data/BlockForm";
import { RecipeForm } from "@/components/data/RecipeForm";
import { SavedSnippets } from "@/components/data/SavedSnippets";
import { BLOCK_EXAMPLE_ROW, ITEM_EXAMPLE_ROW } from "@/lib/sc2Data";

const SECTIONS = [
  { id: "Creature", icon: PawPrint, file: "database.xml", hint: "EntityTemplate built from the real Lion entry. Every Parameter is editable; GUIDs are regenerated so they never clash with the game's." },
  { id: "Block", icon: Boxes, file: "BlocksData.txt", hint: "All 79 real columns from CobblestoneBlock. Output is one semicolon row." },
  { id: "Item", icon: Gem, file: "BlocksData.txt", hint: "Same 79 columns, seeded from the ChestBlock (Items category) row." },
  { id: "Recipe", icon: Hammer, file: "CraftingRecipes.xml", hint: "Exact <Recipe> shape from IronAxeBlock, with a tap-to-fill crafting grid." },
];

export default function DataBuilder() {
  const [section, setSection] = useState("Creature");
  const meta = SECTIONS.find((s) => s.id === section);

  return (
    <section data-testid="data-builder-page" className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-widest text-[#06B6D4]">Tab 05</p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-wide">Data Builder</h2>
        <p className="text-sm text-[#9CA3AF] mt-2 max-w-2xl">Forms built from real Survivalcraft 2.4 Content entries. Only fields that exist in the game files are shown, output pastes straight into your files.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {SECTIONS.map(({ id, icon: Icon, file }) => (
          <button key={id} data-testid={`data-section-${id.toLowerCase()}`} onClick={() => setSection(id)} className={`btn-press min-h-[72px] rounded-sm border flex flex-col items-center justify-center gap-1 transition-colors ${section === id ? "border-[#F59E0B] bg-[#F59E0B]/10 text-[#F59E0B]" : "border-[#2A364F] text-[#9CA3AF] hover:border-[#F59E0B]/50 hover:text-[#F3F4F6]"}`}>
            <Icon className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">{id}</span>
            <span className="font-mono text-[10px] opacity-70">{file}</span>
          </button>
        ))}
      </div>

      <p data-testid="data-section-hint" className="text-sm text-[#9CA3AF] border-l-2 border-[#06B6D4] pl-3">{meta.hint}</p>

      <div key={section} className="rise">
        {section === "Creature" && <CreatureForm />}
        {section === "Block" && <BlockForm kind="Block" exampleRow={BLOCK_EXAMPLE_ROW} />}
        {section === "Item" && <BlockForm kind="Item" exampleRow={ITEM_EXAMPLE_ROW} />}
        {section === "Recipe" && <RecipeForm />}
      </div>

      <SavedSnippets />
    </section>
  );
}

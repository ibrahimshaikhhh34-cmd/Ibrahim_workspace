import { useMemo, useState } from "react";
import { FileCode, RotateCcw, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CREATURE_EXAMPLE_XML, parseCreature, buildCreature } from "@/lib/sc2Data";
import { FieldInput, FieldLabel, OutputPanel } from "@/components/data/Shared";

export const CreatureForm = () => {
  const [xml, setXml] = useState(CREATURE_EXAMPLE_XML);
  const [fields, setFields] = useState(() => parseCreature(CREATURE_EXAMPLE_XML));
  const [values, setValues] = useState(() => Object.fromEntries(parseCreature(CREATURE_EXAMPLE_XML).map((f) => [f.id, f.value])));
  const [fresh, setFresh] = useState(true);
  const [output, setOutput] = useState("");
  const [showXml, setShowXml] = useState(false);

  const groups = useMemo(() => {
    const m = new Map();
    for (const f of fields) { if (!m.has(f.group)) m.set(f.group, []); m.get(f.group).push(f); }
    return [...m.entries()];
  }, [fields]);

  const reparse = (src) => {
    try {
      const f = parseCreature(src);
      setXml(src); setFields(f); setValues(Object.fromEntries(f.map((x) => [x.id, x.value]))); setOutput("");
      toast.success(`Loaded ${f.length} parameters`);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const generate = (e) => {
    e.preventDefault();
    if (!values["@Name"]?.trim()) return toast.error("EntityTemplate Name is required");
    setOutput(buildCreature(xml, values, fresh));
  };

  return (
    <div className="space-y-6">
      <div className="panel p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs uppercase tracking-widest text-[#9CA3AF]">Real example: Lion EntityTemplate (database.xml)</Label>
          <button data-testid="creature-toggle-xml" type="button" onClick={() => setShowXml(!showXml)} className="min-h-[40px] text-xs uppercase tracking-widest text-[#06B6D4] hover:text-[#F3F4F6]">{showXml ? "Hide" : "Show / paste own"}</button>
        </div>
        {showXml && (
          <>
            <Textarea data-testid="creature-example-xml" defaultValue={xml} id="creature-xml-src" rows={10} className="font-mono text-xs bg-[#080B11] border-[#2A364F] text-[#06B6D4]" />
            <Button data-testid="creature-reparse-button" type="button" variant="outline" onClick={() => reparse(document.getElementById("creature-xml-src").value)} className="btn-press h-11 border-[#2A364F] bg-transparent text-[#F3F4F6] hover:bg-[#1E2738] hover:text-[#F3F4F6]"><Wand2 className="h-4 w-4 mr-2" /> Re-parse pasted template</Button>
          </>
        )}
        <div className="flex flex-wrap items-center gap-4">
          <Button data-testid="creature-reset-button" type="button" variant="outline" onClick={() => reparse(CREATURE_EXAMPLE_XML)} className="btn-press h-11 border-[#2A364F] bg-transparent text-[#F3F4F6] hover:bg-[#1E2738] hover:text-[#F3F4F6]"><RotateCcw className="h-4 w-4 mr-2" /> Reset to Lion</Button>
          <label className="flex items-center gap-3 text-sm text-[#9CA3AF] min-h-[44px]">
            <Switch data-testid="creature-fresh-guids" checked={fresh} onCheckedChange={setFresh} />
            Fresh GUIDs on every element <span className="text-[#6B7280] text-xs">(InheritanceParent kept)</span>
          </label>
        </div>
      </div>

      <form data-testid="creature-form" onSubmit={generate} className="panel p-4 sm:p-6 space-y-8">
        {groups.map(([group, fs]) => (
          <fieldset key={group} className="space-y-3">
            <legend className="font-display text-base font-semibold uppercase tracking-wide text-[#F59E0B] mb-2">{group}</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {fs.map((f) => (
                <div key={f.id} className={`space-y-1 ${f.label === "Description" ? "sm:col-span-2 lg:col-span-3" : ""}`}>
                  <FieldLabel field={f} />
                  {f.label === "Description" ? (
                    <Textarea data-testid={`creature-field-${f.label}`} value={values[f.id]} onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))} rows={3} className="bg-[#0B0F17] border-[#2A364F] font-mono text-sm" />
                  ) : (
                    <FieldInput field={f} value={values[f.id]} onChange={(x) => setValues((v) => ({ ...v, [f.id]: x }))} testId={`creature-field-${f.label}`} boolOptions={["True", "False"]} />
                  )}
                </div>
              ))}
            </div>
          </fieldset>
        ))}
        <Button data-testid="creature-generate-button" type="submit" className="btn-press w-full h-12 text-base font-semibold uppercase tracking-wider bg-[#06B6D4] text-[#0B0F17] hover:bg-[#0891B2]">
          <FileCode className="h-5 w-5 mr-2" /> Generate EntityTemplate XML
        </Button>
      </form>

      <OutputPanel kind="Creature" name={values["@Name"]} output={output} fileName="database.xml" testIdPrefix="creature" />
    </div>
  );
};

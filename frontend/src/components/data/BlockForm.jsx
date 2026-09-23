import { useMemo, useState } from "react";
import { FileCode, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BLOCK_COLUMNS, BLOCK_GROUPS, parseBlockRow, buildBlockRow } from "@/lib/sc2Data";
import { FieldInput, FieldLabel, OutputPanel } from "@/components/data/Shared";
import { AtlasPicker } from "@/components/data/AtlasPicker";

const TYPES = Object.fromEntries(BLOCK_COLUMNS);

export const BlockForm = ({ kind, exampleRow }) => {
  const [values, setValues] = useState(() => parseBlockRow(exampleRow));
  const [output, setOutput] = useState("");
  const [showExample, setShowExample] = useState(false);
  const k = kind.toLowerCase();
  const set = (key) => (v) => setValues((s) => ({ ...s, [key]: v }));

  const missing = useMemo(() => BLOCK_COLUMNS.map(([n]) => n).filter((n) => !BLOCK_GROUPS.some(([, f]) => f.includes(n))), []);

  const generate = (e) => {
    e.preventDefault();
    if (!values["Class Name"].trim()) return toast.error("Class Name is required");
    setOutput(buildBlockRow(values));
  };

  const loadFromRow = (row) => {
    if (row.split(";").length < BLOCK_COLUMNS.length) return toast.error(`Expected ${BLOCK_COLUMNS.length} semicolon-separated fields`);
    setValues(parseBlockRow(row));
    toast.success("Row loaded into form");
  };

  return (
    <div className="space-y-6">
      <div className="panel p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs uppercase tracking-widest text-[#9CA3AF]">Real example row ({BLOCK_COLUMNS.length} columns from BlocksData.txt)</Label>
          <button data-testid={`${k}-toggle-example`} type="button" onClick={() => setShowExample(!showExample)} className="min-h-[40px] text-xs uppercase tracking-widest text-[#06B6D4] hover:text-[#F3F4F6]">{showExample ? "Hide" : "Show / paste own row"}</button>
        </div>
        {showExample && (
          <Textarea
            data-testid={`${k}-example-row`}
            defaultValue={exampleRow}
            rows={4}
            onBlur={(e) => e.target.value.trim() !== exampleRow && loadFromRow(e.target.value.trim())}
            className="font-mono text-xs bg-[#080B11] border-[#2A364F] text-[#06B6D4]"
          />
        )}
        <div className="flex gap-2">
          <Button data-testid={`${k}-reset-button`} type="button" variant="outline" onClick={() => { setValues(parseBlockRow(exampleRow)); setOutput(""); }} className="btn-press h-11 border-[#2A364F] bg-transparent text-[#F3F4F6] hover:bg-[#1E2738] hover:text-[#F3F4F6]">
            <RotateCcw className="h-4 w-4 mr-2" /> Reset to example
          </Button>
        </div>
      </div>

      <form data-testid={`${k}-form`} onSubmit={generate} className="panel p-4 sm:p-6 space-y-8">
        {[...BLOCK_GROUPS, ...(missing.length ? [["Other", missing]] : [])].map(([group, names]) => (
          <fieldset key={group} className="space-y-3">
            <legend className="font-display text-base font-semibold uppercase tracking-wide text-[#F59E0B] mb-2">{group}</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {names.map((n) => (
                <div key={n} className={`space-y-1 ${n === "DefaultDescription" ? "sm:col-span-2 lg:col-span-3" : ""}`}>
                  <FieldLabel field={{ label: n, type: TYPES[n] }} />
                  {n === "DefaultDescription" ? (
                    <Textarea data-testid={`${k}-field-DefaultDescription`} value={values[n]} onChange={(e) => set(n)(e.target.value)} rows={3} className="bg-[#0B0F17] border-[#2A364F] font-mono text-sm" />
                  ) : (
                    <FieldInput field={{ type: TYPES[n] }} value={values[n]} onChange={set(n)} testId={`${k}-field-${n.replace(/\s/g, "")}`} />
                  )}
                  {n === "DefaultTextureSlot" && <AtlasPicker value={values[n]} onChange={set(n)} />}
                </div>
              ))}
            </div>
          </fieldset>
        ))}
        <Button data-testid={`${k}-generate-button`} type="submit" className="btn-press w-full h-12 text-base font-semibold uppercase tracking-wider bg-[#06B6D4] text-[#0B0F17] hover:bg-[#0891B2]">
          <FileCode className="h-5 w-5 mr-2" /> Generate BlocksData row
        </Button>
      </form>

      <OutputPanel kind={kind} name={values["Class Name"]} output={output} fileName="BlocksData.txt" testIdPrefix={kind.toLowerCase()} />
    </div>
  );
};

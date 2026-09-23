import { useState } from "react";
import { Copy, Download, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { snippetsApi } from "@/lib/api";

export const FieldInput = ({ field, value, onChange, testId, boolOptions = ["TRUE", "FALSE"] }) => {
  if (field.type === "bool") {
    const v = value === "" ? "__empty" : value;
    const options = boolOptions.includes(value) || value === "" ? boolOptions : [value, ...boolOptions];
    return (
      <Select value={v} onValueChange={(x) => onChange(x === "__empty" ? "" : x)}>
        <SelectTrigger data-testid={testId} className="h-11 bg-[#0B0F17] border-[#2A364F] font-mono text-sm"><SelectValue /></SelectTrigger>
        <SelectContent className="bg-[#121824]/95 backdrop-blur-xl border-[#2A364F]">
          {options.map((o) => <SelectItem key={o} value={o} className="font-mono">{o}</SelectItem>)}
          <SelectItem value="__empty" className="font-mono text-[#6B7280]">(empty)</SelectItem>
        </SelectContent>
      </Select>
    );
  }
  return (
    <Input
      data-testid={testId}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 bg-[#0B0F17] border-[#2A364F] font-mono text-sm"
      placeholder={field.type}
    />
  );
};

export const FieldLabel = ({ field }) => (
  <Label className="text-xs text-[#9CA3AF] flex items-center justify-between gap-2">
    <span className="truncate">{field.label}</span>
    <span className="font-mono text-[10px] text-[#4B5563] shrink-0">{field.type}</span>
  </Label>
);

export const OutputPanel = ({ kind, name, output, fileName, testIdPrefix }) => {
  const [saving, setSaving] = useState(false);
  if (!output) return null;
  const download = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([output], { type: "text/plain" }));
    a.download = fileName;
    a.click();
  };
  const save = async () => {
    setSaving(true);
    try {
      await snippetsApi.create({ kind, name: name || kind, content: output });
      toast.success("Saved to snippet library");
      window.dispatchEvent(new Event("snippets-changed"));
    } catch {
      toast.error("Could not save snippet");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="panel p-4 sm:p-6 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label className="text-xs uppercase tracking-widest text-[#9CA3AF]">Generated · paste into {fileName}</Label>
        <div className="flex gap-1">
          <Button data-testid={`${testIdPrefix}-copy-button`} variant="ghost" onClick={() => navigator.clipboard.writeText(output).then(() => toast.success("Copied"))} className="h-11 text-[#06B6D4] hover:text-[#06B6D4] hover:bg-[#1E2738]"><Copy className="h-4 w-4 mr-1" /> Copy</Button>
          <Button data-testid={`${testIdPrefix}-download-button`} variant="ghost" onClick={download} className="h-11 text-[#06B6D4] hover:text-[#06B6D4] hover:bg-[#1E2738]"><Download className="h-4 w-4 mr-1" /> File</Button>
          <Button data-testid={`${testIdPrefix}-save-button`} variant="ghost" disabled={saving} onClick={save} className="h-11 text-[#F59E0B] hover:text-[#F59E0B] hover:bg-[#1E2738]"><Save className="h-4 w-4 mr-1" /> Save</Button>
        </div>
      </div>
      <pre data-testid={`${testIdPrefix}-output`} className="font-mono text-xs sm:text-sm text-[#06B6D4] bg-[#080B11] p-4 rounded border border-[#1E2738] overflow-x-auto scrollbar-thin whitespace-pre-wrap break-all">{output}</pre>
    </div>
  );
};

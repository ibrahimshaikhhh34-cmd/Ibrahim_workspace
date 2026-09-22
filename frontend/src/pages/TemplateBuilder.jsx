import { useMemo, useState } from "react";
import { Copy, Download, Wand2, FileCode } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { parseTemplate, generateXml, PRESETS } from "@/lib/xmlTemplate";

export default function TemplateBuilder() {
  const [xml, setXml] = useState("");
  const [parsed, setParsed] = useState(null);
  const [values, setValues] = useState({});
  const [output, setOutput] = useState("");

  const parse = () => {
    try {
      const p = parseTemplate(xml);
      if (p.fields.length === 0) return toast.error("No attributes or values found in that XML");
      setParsed(p);
      setValues(Object.fromEntries(p.fields.map((f) => [f.id, f.value])));
      setOutput("");
      toast.success(`Found ${p.fields.length} fields in <${p.root}>`);
    } catch (e) {
      toast.error(`XML error: ${e.message}`);
    }
  };

  const generate = (e) => {
    e.preventDefault();
    setOutput(generateXml(xml, values));
  };

  const groups = useMemo(() => {
    if (!parsed) return [];
    const map = new Map();
    for (const f of parsed.fields) {
      if (!map.has(f.group)) map.set(f.group, []);
      map.get(f.group).push(f);
    }
    return [...map.entries()];
  }, [parsed]);

  const download = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([output], { type: "application/xml" }));
    a.download = `${(values[parsed.fields.find((f) => f.attr === "Name")?.id] || "template").replace(/\W+/g, "_")}.xml`;
    a.click();
  };

  return (
    <section data-testid="template-builder-page" className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-widest text-[#06B6D4]">Tab 04</p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-wide">Template Builder</h2>
        <p className="text-sm text-[#9CA3AF] mt-2 max-w-2xl">Paste one working SC2 entity XML. The form uses only the fields found in your example, nothing invented.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="panel tactical-corner p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Label className="text-xs uppercase tracking-widest text-[#9CA3AF]">Example XML</Label>
            <Select onValueChange={(k) => setXml(PRESETS[k])}>
              <SelectTrigger data-testid="template-preset-select" className="h-11 w-44 bg-[#0B0F17] border-[#2A364F]"><SelectValue placeholder="Load a sample" /></SelectTrigger>
              <SelectContent className="bg-[#121824]/95 backdrop-blur-xl border-[#2A364F]">
                {Object.keys(PRESETS).map((k) => <SelectItem key={k} value={k}>{k} sample</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Textarea
            data-testid="template-xml-input"
            value={xml}
            onChange={(e) => setXml(e.target.value)}
            rows={12}
            placeholder='<Template Name="MyCreature" …>'
            className="font-mono text-xs sm:text-sm bg-[#080B11] border-[#2A364F] text-[#06B6D4] placeholder:text-[#4B5563]"
          />
          <Button data-testid="template-parse-button" onClick={parse} className="btn-press w-full h-12 text-base font-semibold uppercase tracking-wider bg-[#F59E0B] text-[#0B0F17] hover:bg-[#D97706]">
            <Wand2 className="h-5 w-5 mr-2" /> Parse Structure
          </Button>
        </div>

        <div className="space-y-6">
          {parsed ? (
            <form data-testid="template-generated-form" onSubmit={generate} className="panel p-4 sm:p-6 space-y-6">
              <p className="font-mono text-xs text-[#6B7280]">&lt;{parsed.root}&gt; · {parsed.fields.length} fields</p>
              {groups.map(([group, fields]) => (
                <fieldset key={group} className="space-y-3">
                  <legend className="font-display text-base font-semibold uppercase tracking-wide text-[#F59E0B] mb-2">{group}</legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {fields.map((f) => (
                      <div key={f.id} className="space-y-1">
                        <Label className="text-xs text-[#9CA3AF]">{f.label}</Label>
                        <Input
                          data-testid={`template-field-${f.attr || "text"}`}
                          value={values[f.id] ?? ""}
                          onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))}
                          className="h-11 bg-[#0B0F17] border-[#2A364F] font-mono text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </fieldset>
              ))}
              <Button data-testid="template-generate-button" type="submit" className="btn-press w-full h-12 text-base font-semibold uppercase tracking-wider bg-[#06B6D4] text-[#0B0F17] hover:bg-[#0891B2]">
                <FileCode className="h-5 w-5 mr-2" /> Generate XML
              </Button>
            </form>
          ) : (
            <div className="panel p-10 border-dashed text-center">
              <p className="font-display text-xl uppercase text-[#9CA3AF]">Form appears here</p>
              <p className="text-sm text-[#6B7280] mt-2">Parse an example first.</p>
            </div>
          )}

          {output && (
            <div className="panel p-4 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs uppercase tracking-widest text-[#9CA3AF]">Generated XML</Label>
                <div className="flex gap-2">
                  <Button data-testid="template-copy-button" variant="ghost" onClick={() => navigator.clipboard.writeText(output).then(() => toast.success("XML copied"))} className="h-11 text-[#06B6D4] hover:text-[#06B6D4] hover:bg-[#1E2738]">
                    <Copy className="h-4 w-4 mr-1" /> Copy
                  </Button>
                  <Button data-testid="template-download-button" variant="ghost" onClick={download} className="h-11 text-[#06B6D4] hover:text-[#06B6D4] hover:bg-[#1E2738]">
                    <Download className="h-4 w-4 mr-1" /> .xml
                  </Button>
                </div>
              </div>
              <pre data-testid="template-output-code" className="font-mono text-xs sm:text-sm text-[#06B6D4] bg-[#080B11] p-4 rounded border border-[#1E2738] overflow-x-auto scrollbar-thin">
                {output}
              </pre>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

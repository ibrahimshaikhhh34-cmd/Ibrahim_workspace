import { useMemo, useState } from "react";
import { Copy, Search, FileText, ChevronDown, ChevronUp, Wrench, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { parseLog, SAMPLE_LOG } from "@/lib/logParser";

const KIND_LABEL = { model: "Missing Model", texture: "Missing Texture", template: "Broken Template", bestiary: "Bestiary" };

const ErrorCard = ({ g }) => {
  const [open, setOpen] = useState(false);
  return (
    <li data-testid="log-error-card" className={`panel p-5 border-l-4 ${g.known ? "border-l-[#F59E0B]" : "border-l-[#EF4444]"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-widest text-[#6B7280] mb-1">
            {g.known ? KIND_LABEL[g.known.kind] : "Unrecognised error"}
          </p>
          <h3 data-testid="log-error-title" className="font-display text-lg sm:text-xl font-bold break-words">
            {g.known ? g.known.title : g.message.slice(0, 140)}
          </h3>
        </div>
        <span data-testid="log-error-count" className="shrink-0 font-mono text-sm px-2.5 py-1 rounded-sm bg-[#0F172A] border border-[#2A364F] text-[#06B6D4]">
          ×{g.count}
        </span>
      </div>
      {g.known ? (
        <p data-testid="log-error-fix" className="mt-3 flex gap-2 text-sm text-[#F3F4F6] leading-relaxed">
          <Wrench className="h-4 w-4 mt-0.5 shrink-0 text-[#F59E0B]" />
          {g.known.fix}
        </p>
      ) : (
        <p className="mt-3 flex gap-2 text-sm text-[#9CA3AF] leading-relaxed break-words">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-[#EF4444]" />
          {g.message}
        </p>
      )}
      {(g.trace.length > 0 || g.known) && (
        <button data-testid="log-error-toggle-trace" onClick={() => setOpen(!open)} className="mt-3 flex items-center gap-1 text-xs uppercase tracking-widest text-[#6B7280] hover:text-[#F3F4F6] min-h-[40px]">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />} Raw log
        </button>
      )}
      {open && (
        <pre className="mt-2 font-mono text-xs text-[#06B6D4] bg-[#080B11] p-3 rounded border border-[#1E2738] overflow-x-auto scrollbar-thin whitespace-pre-wrap break-all">
          {[g.message, ...g.trace].join("\n")}
        </pre>
      )}
    </li>
  );
};

export default function LogReader() {
  const [text, setText] = useState("");
  const [groups, setGroups] = useState(null);

  const parse = () => {
    if (!text.trim()) return toast.error("Paste a Game.log first");
    setGroups(parseLog(text));
  };

  const summary = useMemo(
    () => (groups || []).map((g) => `[x${g.count}] ${g.known ? g.known.title + " — " + g.known.fix : g.message}`).join("\n"),
    [groups]
  );

  return (
    <section data-testid="log-reader-page" className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-widest text-[#06B6D4]">Tab 03</p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-wide">Log Reader</h2>
        <p className="text-sm text-[#9CA3AF] mt-2 max-w-2xl">Paste your Survivalcraft 2 Game.log. Every ERROR / Exception gets grouped, counted and translated into a fix.</p>
      </div>

      <div className="panel tactical-corner p-4 sm:p-6 space-y-4">
        <Textarea
          data-testid="log-paste-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          placeholder="Paste Game.log contents here…"
          className="font-mono text-xs sm:text-sm bg-[#080B11] border-[#2A364F] text-[#06B6D4] placeholder:text-[#4B5563]"
        />
        <div className="flex flex-col sm:flex-row gap-3">
          <Button data-testid="log-parse-button" onClick={parse} className="btn-press h-12 flex-1 text-base font-semibold uppercase tracking-wider bg-[#F59E0B] text-[#0B0F17] hover:bg-[#D97706]">
            <Search className="h-5 w-5 mr-2" /> Analyse Log
          </Button>
          <Button data-testid="log-sample-button" variant="outline" onClick={() => setText(SAMPLE_LOG)} className="btn-press h-12 border-[#2A364F] bg-transparent text-[#F3F4F6] hover:bg-[#1E2738] hover:text-[#F3F4F6]">
            <FileText className="h-4 w-4 mr-2" /> Load sample
          </Button>
        </div>
      </div>

      {groups && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p data-testid="log-result-summary" className="font-mono text-sm text-[#9CA3AF]">
              {groups.length} distinct error{groups.length === 1 ? "" : "s"} · {groups.reduce((a, g) => a + g.count, 0)} total lines
            </p>
            {groups.length > 0 && (
              <Button data-testid="log-copy-summary-button" variant="ghost" onClick={() => navigator.clipboard.writeText(summary).then(() => toast.success("Summary copied"))} className="h-11 text-[#06B6D4] hover:text-[#06B6D4] hover:bg-[#1E2738]">
                <Copy className="h-4 w-4 mr-2" /> Copy summary
              </Button>
            )}
          </div>
          {groups.length === 0 ? (
            <div data-testid="log-no-errors" className="panel p-8 text-center border-dashed">
              <p className="font-display text-xl uppercase text-[#10B981]">No errors found</p>
            </div>
          ) : (
            <ul className="space-y-3">{groups.map((g) => <ErrorCard key={g.id} g={g} />)}</ul>
          )}
        </div>
      )}
    </section>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { projectsApi, PROJECT_TYPES, PROJECT_STATUSES } from "@/lib/api";
import { ProjectDialog } from "@/components/tracker/ProjectDialog";
import { StatusBadge, TypeBadge } from "@/components/tracker/Badges";

export default function ProjectTracker() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialog, setDialog] = useState({ open: false, project: null });

  const load = async () => {
    try {
      setProjects(await projectsApi.list());
    } catch {
      toast.error("Could not load projects");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      projects.filter(
        (p) =>
          (typeFilter === "all" || p.type === typeFilter) &&
          (statusFilter === "all" || p.status === statusFilter) &&
          (query.trim() === "" || `${p.name} ${p.notes}`.toLowerCase().includes(query.toLowerCase()))
      ),
    [projects, typeFilter, statusFilter, query]
  );

  const done = projects.filter((p) => p.status === "Done").length;
  const testing = projects.filter((p) => p.status === "In-Game Tested").length;

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    await projectsApi.remove(p.id);
    toast.success("Entry deleted");
    load();
  };

  return (
    <section data-testid="tracker-page" className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#06B6D4]">Tab 01</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-wide">Project Tracker</h2>
        </div>
        <Button
          data-testid="add-project-button"
          onClick={() => setDialog({ open: true, project: null })}
          className="btn-press h-12 px-6 text-base font-semibold uppercase tracking-wider bg-[#F59E0B] text-[#0B0F17] hover:bg-[#D97706]"
        >
          <Plus className="h-5 w-5 mr-1" /> Add Entry
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          ["Total", projects.length, "total-count"],
          ["Done", projects.length ? `${Math.round((done / projects.length) * 100)}%` : "0%", "done-percent"],
          ["In Testing", testing, "testing-count"],
        ].map(([label, value, id]) => (
          <div key={id} className="panel tactical-corner p-4">
            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-[#6B7280]">{label}</p>
            <p data-testid={id} className="font-display text-3xl font-bold text-[#F3F4F6] mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
          <Input
            data-testid="project-search-input"
            placeholder="Search name or notes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 pl-10 bg-[#121824] border-[#2A364F]"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger data-testid="project-type-filter" className="h-12 bg-[#121824] border-[#2A364F]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent className="bg-[#121824]/95 backdrop-blur-xl border-[#2A364F]">
            <SelectItem value="all">All types</SelectItem>
            {PROJECT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger data-testid="project-status-filter" className="h-12 bg-[#121824] border-[#2A364F]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#121824]/95 backdrop-blur-xl border-[#2A364F]">
            <SelectItem value="all">All statuses</SelectItem>
            {PROJECT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-[#6B7280] font-mono text-sm">Loading registry…</p>
      ) : filtered.length === 0 ? (
        <div data-testid="tracker-empty" className="panel p-10 text-center border-dashed">
          <p className="font-display text-xl uppercase text-[#9CA3AF]">No entries yet</p>
          <p className="text-sm text-[#6B7280] mt-2">Add your first creature, weapon, block or item.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <li key={p.id} data-testid="project-card-item" className="panel panel-hover p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <h3 data-testid="project-card-name" className="font-display text-xl font-bold leading-tight break-words">{p.name}</h3>
                <TypeBadge type={p.type} />
              </div>
              <StatusBadge status={p.status} />
              {p.notes && <p className="text-sm text-[#9CA3AF] whitespace-pre-wrap break-words line-clamp-4">{p.notes}</p>}
              <div className="mt-auto flex gap-2 pt-2">
                <Button
                  data-testid="edit-project-button"
                  variant="outline"
                  onClick={() => setDialog({ open: true, project: p })}
                  className="btn-press h-11 flex-1 border-[#2A364F] bg-transparent text-[#F3F4F6] hover:bg-[#1E2738] hover:text-[#F3F4F6]"
                >
                  <Pencil className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button
                  data-testid="delete-project-button"
                  variant="outline"
                  onClick={() => remove(p)}
                  className="btn-press h-11 border-[#2A364F] bg-transparent text-[#EF4444] hover:bg-[#2A1215] hover:text-[#EF4444]"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ProjectDialog
        open={dialog.open}
        project={dialog.project}
        onClose={() => setDialog({ open: false, project: null })}
        onSaved={load}
      />
    </section>
  );
}

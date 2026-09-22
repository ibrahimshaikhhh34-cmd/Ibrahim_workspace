import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { projectsApi, PROJECT_TYPES, PROJECT_STATUSES } from "@/lib/api";

const EMPTY = { name: "", type: "Creature", status: "Idea", notes: "" };

export const ProjectDialog = ({ open, project, onClose, onSaved }) => {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(project ? { name: project.name, type: project.type, status: project.status, notes: project.notes } : EMPTY);
  }, [open, project]);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");
    setSaving(true);
    try {
      if (project) await projectsApi.update(project.id, form);
      else await projectsApi.create(form);
      toast.success(project ? "Entry updated" : "Entry added");
      onSaved();
      onClose();
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent data-testid="project-dialog" className="bg-[#121824]/95 backdrop-blur-xl border-[#2A364F] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl uppercase tracking-wide">
            {project ? "Edit Entry" : "New Entry"}
          </DialogTitle>
          <DialogDescription className="text-xs text-[#6B7280]">Track a creature, weapon, block or item in your mod.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-[#9CA3AF]">Name</Label>
            <Input data-testid="project-name-input" value={form.name} onChange={(e) => set("name")(e.target.value)} className="h-12 bg-[#0B0F17] border-[#2A364F]" placeholder="e.g. FrostWolf" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-[#9CA3AF]">Type</Label>
              <Select value={form.type} onValueChange={set("type")}>
                <SelectTrigger data-testid="project-type-select" className="h-12 bg-[#0B0F17] border-[#2A364F]"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#121824]/95 backdrop-blur-xl border-[#2A364F]">
                  {PROJECT_TYPES.map((t) => <SelectItem key={t} value={t} data-testid={`type-option-${t}`}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-[#9CA3AF]">Status</Label>
              <Select value={form.status} onValueChange={set("status")}>
                <SelectTrigger data-testid="project-status-select" className="h-12 bg-[#0B0F17] border-[#2A364F]"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#121824]/95 backdrop-blur-xl border-[#2A364F]">
                  {PROJECT_STATUSES.map((s) => <SelectItem key={s} value={s} data-testid={`status-option-${s.replace(/\s/g, "-")}`}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-[#9CA3AF]">Notes</Label>
            <Textarea data-testid="project-notes-input" value={form.notes} onChange={(e) => set("notes")(e.target.value)} rows={4} className="bg-[#0B0F17] border-[#2A364F]" placeholder="Free-text notes, todo, texture ideas…" />
          </div>
          <Button data-testid="project-save-button" type="submit" disabled={saving} className="btn-press w-full h-12 text-base font-semibold uppercase tracking-wider bg-[#F59E0B] text-[#0B0F17] hover:bg-[#D97706]">
            {saving ? "Saving…" : project ? "Save Changes" : "Add to Tracker"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

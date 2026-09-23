import { useEffect, useState } from "react";
import { Copy, Trash2, Library } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { snippetsApi } from "@/lib/api";

export const SavedSnippets = () => {
  const [items, setItems] = useState([]);
  const [openId, setOpenId] = useState(null);

  const load = () => snippetsApi.list().then(setItems).catch(() => {});
  useEffect(() => {
    load();
    window.addEventListener("snippets-changed", load);
    return () => window.removeEventListener("snippets-changed", load);
  }, []);

  const remove = async (id) => {
    await snippetsApi.remove(id);
    toast.success("Snippet deleted");
    load();
  };

  return (
    <div data-testid="snippet-library" className="panel p-4 sm:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Library className="h-4 w-4 text-[#F59E0B]" />
        <h3 className="font-display text-lg font-semibold uppercase tracking-wide">Snippet library</h3>
        <span className="font-mono text-xs text-[#6B7280]">{items.length} saved</span>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-[#6B7280]">Generated rows and templates you save appear here, persisted in the database.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((s) => (
            <li key={s.id} data-testid="snippet-item" className="border border-[#2A364F] rounded-sm bg-[#0B0F17]">
              <div className="flex items-center gap-3 p-3">
                <button type="button" onClick={() => setOpenId(openId === s.id ? null : s.id)} className="flex-1 text-left min-h-[40px] flex items-center gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-1 rounded-sm bg-[#0F172A] border border-[#2A364F] text-[#06B6D4]">{s.kind}</span>
                  <span data-testid="snippet-name" className="font-semibold truncate">{s.name}</span>
                  <span className="text-xs text-[#6B7280] ml-auto hidden sm:inline">{new Date(s.created_at).toLocaleDateString()}</span>
                </button>
                <Button data-testid="snippet-copy-button" variant="ghost" onClick={() => navigator.clipboard.writeText(s.content).then(() => toast.success("Copied"))} className="h-10 w-10 p-0 text-[#06B6D4] hover:text-[#06B6D4] hover:bg-[#1E2738]"><Copy className="h-4 w-4" /></Button>
                <Button data-testid="snippet-delete-button" variant="ghost" onClick={() => remove(s.id)} className="h-10 w-10 p-0 text-[#EF4444] hover:text-[#EF4444] hover:bg-[#2A1215]"><Trash2 className="h-4 w-4" /></Button>
              </div>
              {openId === s.id && <pre className="font-mono text-xs text-[#06B6D4] bg-[#080B11] p-3 border-t border-[#1E2738] overflow-x-auto scrollbar-thin whitespace-pre-wrap break-all">{s.content}</pre>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

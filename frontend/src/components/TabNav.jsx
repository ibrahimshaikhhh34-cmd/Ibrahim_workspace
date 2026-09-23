import { FolderKanban, Box, Terminal, FileCode, Database } from "lucide-react";

export const TABS = [
  { id: "tracker", label: "Project Tracker", short: "Tracker", icon: FolderKanban },
  { id: "model-prep", label: "Model Prep", short: "Model", icon: Box },
  { id: "log-reader", label: "Log Reader", short: "Logs", icon: Terminal },
  { id: "template-builder", label: "Template Builder", short: "Template", icon: FileCode },
  { id: "data-builder", label: "Data Builder", short: "Data", icon: Database },
];

export const TabNav = ({ active, onChange, variant }) => {
  if (variant === "top") {
    return (
      <nav className="hidden md:flex gap-1 -mb-px" aria-label="Sections">
        {TABS.map(({ id, label, icon: Icon }) => {
          const on = id === active;
          return (
            <button
              key={id}
              data-testid={`tab-${id}`}
              onClick={() => onChange(id)}
              className={`btn-press flex items-center gap-2 px-5 py-3 text-sm font-semibold uppercase tracking-wider border-b-2 transition-colors duration-200 ${
                on
                  ? "border-[#F59E0B] text-[#F59E0B]"
                  : "border-transparent text-[#9CA3AF] hover:text-[#F3F4F6] hover:border-[#2A364F]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </nav>
    );
  }
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[#2A364F] bg-[#0B0F17]/95 backdrop-blur-xl grid grid-cols-5"
      aria-label="Sections"
    >
      {TABS.map(({ id, short, icon: Icon }) => {
        const on = id === active;
        return (
          <button
            key={id}
            data-testid={`tab-${id}-mobile`}
            onClick={() => onChange(id)}
            className={`btn-press min-h-[64px] flex flex-col items-center justify-center gap-1 text-[11px] font-semibold uppercase tracking-wider transition-colors duration-200 ${
              on ? "text-[#F59E0B] bg-[#121824]" : "text-[#9CA3AF]"
            }`}
          >
            <Icon className="h-5 w-5" />
            {short}
          </button>
        );
      })}
    </nav>
  );
};

const STATUS_COLORS = {
  Idea: "#A855F7",
  "Model Made": "#3B82F6",
  Textured: "#EC4899",
  "In-Game Tested": "#F59E0B",
  Done: "#10B981",
};

export const StatusBadge = ({ status }) => {
  const c = STATUS_COLORS[status] || "#9CA3AF";
  return (
    <span
      data-testid="project-status-badge"
      className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-sm w-fit"
      style={{ color: c, background: `${c}1A`, border: `1px solid ${c}55` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
      {status}
    </span>
  );
};

export const TypeBadge = ({ type }) => (
  <span
    data-testid="project-type-badge"
    className="shrink-0 font-mono text-[11px] uppercase tracking-widest px-2 py-1 rounded-sm bg-[#0F172A] border border-[#2A364F] text-[#06B6D4]"
  >
    {type}
  </span>
);

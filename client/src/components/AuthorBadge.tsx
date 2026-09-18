export default function AuthorBadge({
  name,
  type,
  color,
}: {
  name: string;
  type: "ai" | "human";
  color?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-ink">
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: color || (type === "ai" ? "#0d9488" : "#7c3aed") }}
      />
      <span className="font-medium">{name}</span>
      <span
        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
          type === "ai" ? "bg-aiTag/10 text-aiTag" : "bg-humanTag/10 text-humanTag"
        }`}
      >
        {type === "ai" ? "AI" : "human"}
      </span>
    </span>
  );
}

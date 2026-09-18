import { Link } from "react-router-dom";

export default function Tag({ tag, count }: { tag: string; count?: number }) {
  return (
    <Link
      to={`/?tag=${encodeURIComponent(tag)}`}
      className="inline-flex items-center gap-1 rounded-md border border-line bg-canvas px-2 py-0.5 font-mono text-xs text-subtle hover:border-accent hover:text-accent"
    >
      {tag}
      {typeof count === "number" && <span className="text-subtle/60">{count}</span>}
    </Link>
  );
}

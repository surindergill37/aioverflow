import { Link } from "react-router-dom";
import type { Post } from "../api";
import AuthorBadge from "./AuthorBadge";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3.6e6);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link
      to={`/posts/${post.id}`}
      className="block rounded-lg border border-line bg-surface p-5 transition-colors hover:border-accent/40"
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-base font-semibold text-ink">{post.title}</h3>
        <span
          className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${
            post.status === "resolved" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
          }`}
        >
          {post.status === "resolved" ? "resolved" : "open"}
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-subtle">{post.body}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {post.tags.map((t) => (
          <span key={t} className="rounded-md border border-line bg-canvas px-2 py-0.5 font-mono text-xs text-subtle">
            {t}
          </span>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-subtle">
        <AuthorBadge name={post.authorName} type={post.authorType} />
        <div className="flex items-center gap-4">
          <span>{post.resolutionCount ?? 0} resolutions</span>
          <span>{post.commentCount ?? 0} comments</span>
          <span>{timeAgo(post.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}

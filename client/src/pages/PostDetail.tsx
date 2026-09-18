import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, type Post } from "../api";
import AuthorBadge from "../components/AuthorBadge";
import Tag from "../components/Tag";
import { useAuth } from "../AuthContext";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function PostDetail() {
  const { id } = useParams();
  const { auth } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [posting, setPosting] = useState(false);

  const load = () => {
    if (!id) return;
    api.getPost(id).then(setPost).catch((e) => setError(e.message));
  };

  useEffect(load, [id]);

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !id || !commentBody.trim()) return;
    setPosting(true);
    try {
      await api.postComment(auth.token, id, commentBody.trim());
      setCommentBody("");
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setPosting(false);
    }
  };

  if (error) return <div className="mx-auto max-w-3xl px-6 py-16 text-sm text-red-600">{error}</div>;
  if (!post) return <div className="mx-auto max-w-3xl px-6 py-16 text-sm text-subtle">Loading...</div>;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link to="/" className="text-sm text-subtle hover:text-ink">
        ← back to feed
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold text-ink">{post.title}</h1>
        <span
          className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${
            post.status === "resolved" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
          }`}
        >
          {post.status === "resolved" ? "resolved" : "open"}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-subtle">
        <AuthorBadge name={post.authorName} type={post.authorType} />
        <span>{formatDate(post.createdAt)}</span>
      </div>

      <p className="prose-body mt-5 text-[15px] leading-relaxed text-ink">{post.body}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {post.tags.map((t) => (
          <Tag key={t} tag={t} />
        ))}
      </div>

      <h2 className="mt-10 mb-4 text-sm font-semibold text-ink">
        {post.resolutions?.length || 0} resolution{post.resolutions?.length === 1 ? "" : "s"}
      </h2>
      <div className="flex flex-col gap-4">
        {post.resolutions?.map((r) => (
          <div
            key={r.id}
            className={`rounded-lg border p-4 ${r.accepted ? "border-emerald-300 bg-emerald-50/40" : "border-line bg-surface"}`}
          >
            {r.accepted && <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">✓ Accepted resolution</div>}
            <p className="prose-body text-[15px] leading-relaxed text-ink">{r.body}</p>
            <div className="mt-3 flex items-center justify-between text-sm text-subtle">
              <AuthorBadge name={r.authorName} type={r.authorType} />
              <span>{formatDate(r.createdAt)}</span>
            </div>
          </div>
        ))}
        {(!post.resolutions || post.resolutions.length === 0) && (
          <p className="text-sm text-subtle">No resolutions yet. Any registered AI can add one via the API.</p>
        )}
      </div>

      <h2 className="mt-10 mb-4 text-sm font-semibold text-ink">
        {post.comments?.length || 0} comment{post.comments?.length === 1 ? "" : "s"}
      </h2>
      <div className="flex flex-col gap-3">
        {post.comments?.map((c) => (
          <div key={c.id} className="rounded-md bg-canvas px-4 py-3">
            <p className="text-sm text-ink">{c.body}</p>
            <div className="mt-1.5 flex items-center gap-2 text-xs text-subtle">
              <span className="font-medium text-ink">{c.username}</span>
              <span>{formatDate(c.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>

      {auth ? (
        <form onSubmit={submitComment} className="mt-4 flex flex-col gap-2">
          <textarea
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            placeholder="Add a comment..."
            rows={2}
            className="w-full rounded-md border border-line px-3 py-2 text-sm focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            disabled={posting || !commentBody.trim()}
            className="self-end rounded-md bg-ink px-4 py-1.5 text-sm font-medium text-white disabled:opacity-40"
          >
            {posting ? "Posting..." : "Comment"}
          </button>
        </form>
      ) : (
        <p className="mt-4 text-sm text-subtle">
          <Link to="/login" className="text-accent hover:underline">
            Sign in
          </Link>{" "}
          to comment on this post.
        </p>
      )}
    </div>
  );
}

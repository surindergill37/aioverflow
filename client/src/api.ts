const BASE = "/api";

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export type Post = {
  id: string;
  authorType: "ai" | "human";
  authorId: string;
  authorName: string;
  title: string;
  body: string;
  tags: string[];
  status: "open" | "resolved";
  createdAt: string;
  resolutionCount?: number;
  commentCount?: number;
  resolutions?: Resolution[];
  comments?: Comment[];
};

export type Resolution = {
  id: string;
  postId: string;
  authorType: "ai" | "human";
  authorName: string;
  body: string;
  accepted: boolean;
  createdAt: string;
};

export type Comment = {
  id: string;
  postId: string;
  username: string;
  body: string;
  createdAt: string;
};

export type AiProfile = {
  id: string;
  name: string;
  provider: string;
  bio: string;
  avatarColor: string;
  createdAt: string;
  postCount: number;
  keyPreview: string;
};

export const api = {
  health: () => request("/health"),

  // Posts
  listPosts: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/posts${qs ? `?${qs}` : ""}`) as Promise<Post[]>;
  },
  getPost: (id: string) => request(`/posts/${id}`) as Promise<Post>,
  getTags: () => request("/posts/tags") as Promise<{ tag: string; count: number }[]>,

  // AI actions (require an AI API key)
  registerAi: (body: { name: string; provider?: string; bio?: string }) =>
    request("/ai/register", { method: "POST", body: JSON.stringify(body) }),
  listAis: () => request("/ai") as Promise<AiProfile[]>,
  createPost: (apiKey: string, body: { title: string; body: string; tags: string[] }) =>
    request("/posts", { method: "POST", headers: { Authorization: `Bearer ${apiKey}` }, body: JSON.stringify(body) }),
  createResolution: (apiKey: string, postId: string, body: string) =>
    request(`/posts/${postId}/resolutions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ body }),
    }),
  acceptResolution: (apiKey: string, postId: string, resId: string) =>
    request(`/posts/${postId}/resolutions/${resId}/accept`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${apiKey}` },
    }),

  // Human auth
  registerUser: (username: string, password: string) =>
    request("/auth/register", { method: "POST", body: JSON.stringify({ username, password }) }),
  loginUser: (username: string, password: string) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  postComment: (token: string, postId: string, body: string) =>
    request(`/posts/${postId}/comments`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ body }),
    }),
};

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.loginUser(username, password);
      login(res.token, res.user);
      navigate("/");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="text-xl font-semibold text-ink">Sign in</h1>
      <p className="mt-1 text-sm text-subtle">
        Demo accounts: <code className="font-mono text-xs">maya_builds</code> / <code className="font-mono text-xs">password123</code>
      </p>
      <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="username"
          className="rounded-md border border-line px-3 py-2 text-sm focus:border-accent focus:outline-none"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="password"
          className="rounded-md border border-line px-3 py-2 text-sm focus:border-accent focus:outline-none"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} type="submit" className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white disabled:opacity-40">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="mt-4 text-sm text-subtle">
        No account?{" "}
        <Link to="/register" className="text-accent hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

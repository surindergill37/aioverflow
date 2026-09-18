import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../AuthContext";

const links = [
  { to: "/", label: "Feed" },
  { to: "/directory", label: "AI Directory" },
  { to: "/console", label: "API Console" },
  { to: "/docs", label: "Docs" },
];

export default function Navbar() {
  const { auth, logout } = useAuth();

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
        <Link to="/" className="flex items-baseline gap-1.5">
          <span className="font-mono text-lg font-bold text-ink">AI</span>
          <span className="font-mono text-lg font-bold text-accent">Overflow</span>
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => `text-sm ${isActive ? "font-medium text-ink" : "text-subtle hover:text-ink"}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3 text-sm">
          {auth ? (
            <>
              <span className="text-subtle">
                signed in as <span className="font-medium text-ink">{auth.user.username}</span>
              </span>
              <button onClick={logout} className="text-subtle hover:text-ink">
                sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-subtle hover:text-ink">
                Sign in
              </Link>
              <Link to="/register" className="rounded-md bg-ink px-3 py-1.5 font-medium text-white hover:bg-ink/90">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

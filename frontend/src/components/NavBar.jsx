import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function NavBar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const links = user
    ? [
        { to: "/", label: "Dashboard" },
        { to: "/books", label: "Books" },
        { to: "/borrowings", label: "Borrowings" },
        { to: "/history", label: "History" },
      ]
    : [
        { to: "/", label: "Dashboard" },
        { to: "/books", label: "Books" },
      ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="nav">
      <div className="nav-left">
        <span className="brand">Library</span>
        {links.map((l) => (
          <Link key={l.to} to={l.to} className={isActive(l.to) ? "active" : ""}>
            {l.label}
          </Link>
        ))}
      </div>
      <div className="nav-right">
        <button onClick={toggleTheme} className="ghost" style={{ marginRight: '10px', padding: '6px' }}>
          {theme === "light" ? "🌙" : "☀️"}
        </button>
        {user ? (
          <>
            <span className="pill">{user.role}</span>
            <span>{user.name}</span>
            <button className="ghost" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={isActive("/login") ? "active" : ""}>
              Login
            </Link>
            <Link to="/register" className={isActive("/register") ? "active" : ""}>
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

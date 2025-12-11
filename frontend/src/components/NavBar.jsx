import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const { user, logout } = useAuth();
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
        <span className="brand">📚 Library Management</span>
        {links.map((l) => (
          <Link key={l.to} to={l.to} className={isActive(l.to) ? "active" : ""}>
            {l.label}
          </Link>
        ))}
      </div>
      <div className="nav-right">
        {user ? (
          <>
            <span className="pill">{user.role}</span>
            <span className="user-name">{user.name}</span>
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

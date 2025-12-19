import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function NavBar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const links = user
    ? [
        { to: "/", label: "Dasbor" },
        { to: "/books", label: "Buku" },
        { to: "/borrowings", label: "Peminjaman" },
        { to: "/history", label: "Riwayat" },
      ]
    : [
        { to: "/", label: "Dasbor" },
        { to: "/books", label: "Buku" },
      ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="nav">
      <div className="nav-left">
        <span className="brand">PustakaOne</span>
        {links.map((l) => (
          <Link key={l.to} to={l.to} className={isActive(l.to) ? "active" : ""}>
            {l.label}
          </Link>
        ))}
      </div>
      <div className="nav-right">
        <button onClick={toggleTheme} className="ghost theme-toggle">
          {theme === "light" ? "🌙" : "☀️"}
        </button>
        {user ? (
          <>
            <span className={`role-badge role-${user.role}`}>
              {user.role}
            </span>
            <span className="user-name">{user.name}</span>
            <button className="ghost logout-btn" onClick={logout}>
              Keluar
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={isActive("/login") ? "active" : ""}>
              Masuk
            </Link>
            <Link to="/register" className={isActive("/register") ? "active" : ""}>
              Daftar
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

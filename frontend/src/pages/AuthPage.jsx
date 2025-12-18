import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthPage({ mode = "login" }) {
  const isLogin = mode === "login";
  const { login, register, setError, error } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "member",
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await register(form);
      }
      const next = searchParams.get("next") || "/";
      navigate(next, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Decorative */}
        <div className="auth-hero">
          <div className="auth-hero-overlay"></div>
          <div className="auth-hero-content">
            <h1 className="auth-hero-title">Library Management System</h1>
            <p className="auth-hero-subtitle">
              {isLogin 
                ? "Selamat datang kembali! Silakan masuk ke akun Anda untuk mengakses koleksi buku kami."
                : "Bergabunglah dengan kami dan nikmati akses ke ribuan koleksi buku dari perpustakaan kami."}
            </p>
            <div className="auth-hero-features">
              <div className="auth-feature">
                <span className="auth-feature-icon">✓</span>
                <span>Koleksi Buku Lengkap</span>
              </div>
              <div className="auth-feature">
                <span className="auth-feature-icon">✓</span>
                <span>Mudah Dipinjam</span>
              </div>
              <div className="auth-feature">
                <span className="auth-feature-icon">✓</span>
                <span>Gratis untuk Member</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-form-container">
          <div className="auth-form-wrapper">
            <div className="auth-header">
              <h2 className="auth-title">{isLogin ? "Masuk" : "Daftar Akun"}</h2>
              <p className="auth-description">
                {isLogin 
                  ? "Masukkan email dan password Anda"
                  : "Buat akun baru untuk memulai"}
              </p>
            </div>

            <form className="auth-form" onSubmit={onSubmit}>
              {!isLogin && (
                <div className="input-group">
                  <label className="input-label">
                    Nama Lengkap
                  </label>
                  <input
                    className="input-field"
                    placeholder="Masukkan nama lengkap Anda"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              )}
              
              <div className="input-group">
                <label className="input-label">
                  Email
                </label>
                <input
                  className="input-field"
                  type="email"
                  placeholder="nama@email.com"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              
              <div className="input-group">
                <label className="input-label">
                  Password
                </label>
                <input
                  className="input-field"
                  type="password"
                  placeholder="Masukkan password Anda"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
              
              {!isLogin && (
                <div className="input-group">
                  <label className="input-label">
                    Role
                  </label>
                  <select
                    className="input-field"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="member">Member</option>
                    <option value="librarian">Librarian</option>
                  </select>
                </div>
              )}
              
              {error && (
                <div className="auth-error">
                  {error}
                </div>
              )}
              
              <button className="auth-submit-btn" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Loading...
                  </>
                ) : (
                  <>
                    {isLogin ? "Masuk" : "Daftar"}
                    <span className="btn-arrow">→</span>
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}
                <Link to={isLogin ? "/register" : "/login"} className="auth-link">
                  {isLogin ? "Daftar sekarang" : "Masuk di sini"}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
    <div className="card narrow">
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>
        <p className="muted">
          {isLogin 
            ? "Login to access your library account" 
            : "Register to start borrowing books"}
        </p>
      </div>

      <form className="form" onSubmit={onSubmit}>
        {!isLogin && (
          <label>
            <span>Full Name</span>
            <input
              required
              placeholder="Enter your full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
        )}
        <label>
          <span>📧 Email Address</span>
          <input
            type="email"
            required
            placeholder="your.email@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label>
          <span>🔒 Password</span>
          <input
            type="password"
            required
            placeholder={isLogin ? "Enter your password" : "Create a strong password"}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>
        {!isLogin && (
          <label>
            <span>👥 Account Type</span>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="member">📚 Member (Borrow Books)</option>
              <option value="librarian">👨‍💼 Librarian (Manage Library)</option>
            </select>
          </label>
        )}
        {error && <div className="error">❌ {error}</div>}
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "⏳ Processing..." : isLogin ? "🔓 Login" : "✅ Register"}
        </button>
      </form>

      <div style={{ 
        marginTop: '24px', 
        padding: '16px', 
        background: '#f8fafc', 
        borderRadius: '12px',
        textAlign: 'center',
        border: '1px solid #e2e8f0'
      }}>
        <span className="muted">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
        </span>
        <a 
          href={isLogin ? "/register" : "/login"} 
          style={{ 
            color: '#3b82f6', 
            fontWeight: 600,
            textDecoration: 'none'
          }}
        >
          {isLogin ? "Register here" : "Login here"}
        </a>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="stack">
      <div className="card" style={{ textAlign: 'center' }}>
        <h1>Welcome to Library Management</h1>
        <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
          Your digital library companion - borrow, track, and manage books with ease
        </p>
      </div>

      {user && (
          <div className="card">
          <div style={{ textAlign: 'center' }}>
            <h3>Welcome back, {user.name}!</h3>
            <div className="inline" style={{ justifyContent: 'center', marginTop: '12px' }}>
              <span className="badge success">
                {user.role === 'member' ? 'Member' : 'Librarian'}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h2>Features</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px',
          marginTop: '24px'
        }}>
          <div style={{ 
            padding: '24px', 
            background: '#f8fafc', 
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ marginBottom: '8px', fontSize: '1.1rem' }}>Browse Books</h3>
            <p className="muted">Search and discover books from our extensive catalog</p>
          </div>
          
          <div style={{ 
            padding: '24px', 
            background: '#f8fafc', 
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ marginBottom: '8px', fontSize: '1.1rem' }}>Borrow Books</h3>
            <p className="muted">Borrow up to 3 books at a time with 14-day loan period</p>
          </div>
          
          <div style={{ 
            padding: '24px', 
            background: '#f8fafc', 
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ marginBottom: '8px', fontSize: '1.1rem' }}>Track Status</h3>
            <p className="muted">Monitor your borrowings and due dates in real-time</p>
          </div>
          
          <div style={{ 
            padding: '24px', 
            background: '#f8fafc', 
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ marginBottom: '8px', fontSize: '1.1rem' }}>Auto Fine</h3>
            <p className="muted">Automatic fine calculation for late returns (Rp 5,000/day)</p>
          </div>
          
          <div style={{ 
            padding: '24px', 
            background: '#f8fafc', 
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ marginBottom: '8px', fontSize: '1.1rem' }}>View History</h3>
            <p className="muted">Complete borrowing history with transaction details</p>
          </div>
          
          <div style={{ 
            padding: '24px', 
            background: '#f8fafc', 
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ marginBottom: '8px', fontSize: '1.1rem' }}>Fast & Easy</h3>
            <p className="muted">Simple and intuitive interface for quick operations</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Quick Actions</h2>
        {!user ? (
          <div>
            <p className="muted" style={{ marginBottom: '20px' }}>
              Sign in to start borrowing books or create a new account
            </p>
            <div className="actions" style={{ justifyContent: 'center' }}>
              <Link className="btn" to="/login" style={{ textDecoration: 'none' }}>
                Login
              </Link>
              <Link className="btn ghost" to="/register" style={{ textDecoration: 'none' }}>
                Register
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <p className="muted" style={{ marginBottom: '20px' }}>
              Quick access to main features
            </p>
            <div className="actions" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link className="btn" to="/books" style={{ textDecoration: 'none' }}>
                Browse Books
              </Link>
              <Link className="btn success" to="/borrowings" style={{ textDecoration: 'none' }}>
                My Borrowings
              </Link>
              <Link className="btn ghost" to="/history" style={{ textDecoration: 'none' }}>
                View History
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

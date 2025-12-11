import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { statusApi } from "../api/client";

export default function Dashboard() {
  const { user } = useAuth();
  const [serverStatus, setServerStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState(null);

  const checkServerStatus = async () => {
    setStatusLoading(true);
    setStatusError(null);
    setServerStatus(null);
    try {
      const res = await statusApi.check();
      setServerStatus(res);
    } catch (err) {
      setStatusError(err.message);
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <div className="stack">
      <div className="card">
        <h1>Library Management</h1>
        <p>Kelola buku, pinjam, dan kembalikan dengan cepat.</p>
        <ul className="bullets">
          <li>Browse dan cari buku.</li>
          <li>Pinjam buku (maks 3) dan pantau status.</li>
          <li>Pengembalian dengan hitung denda otomatis.</li>
          <li>Riwayat transaksi untuk Member dan Librarian.</li>
        </ul>
        {!user ? (
          <div className="actions">
            <Link className="btn" to="/login">
              Login
            </Link>
            <Link className="btn ghost" to="/register">
              Register
            </Link>
          </div>
        ) : (
          <div className="actions">
            <Link className="btn" to="/books">
              Buka Buku
            </Link>
            <Link className="btn ghost" to="/borrowings">
              Lihat Peminjaman
            </Link>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Server Connection Test</h3>
        <p className="muted">Check if frontend is connected to backend API.</p>
        <div className="actions">
          <button className="btn" onClick={checkServerStatus} disabled={statusLoading}>
            {statusLoading ? "Checking..." : "Check Server Status"}
          </button>
        </div>
        {serverStatus && (
          <div className="status-success">
            <strong>✓ Server OK</strong>
            <pre>{JSON.stringify(serverStatus, null, 2)}</pre>
          </div>
        )}
        {statusError && (
          <div style={{ marginTop: "12px" }} className="error">
            <strong>✗ Connection Failed</strong>
            <div>{statusError}</div>
          </div>
        )}
      </div>
    </div>
  );
}
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="card">
      <div style={{ textAlign: 'center' }}>
        <h1>Welcome to Library Management</h1>
        <p>Kelola buku, pinjam, dan kembalikan dengan cepat dan mudah.</p>
      </div>
      <ul className="bullets">
        <li>Browse dan cari buku favorit Anda.</li>
        <li>Pinjam buku (maks 3) dan pantau status peminjaman.</li>
        <li>Pengembalian dengan hitung denda otomatis.</li>
        <li>Riwayat transaksi untuk Member dan Librarian.</li>
      </ul>
      {!user ? (
        <div className="actions" style={{ justifyContent: 'center' }}>
          <Link className="btn" to="/login" style={{ textDecoration: 'none' }}>
            Login
          </Link>
          <Link className="btn ghost" to="/register" style={{ textDecoration: 'none' }}>
            Register
          </Link>
        </div>
      ) : (
        <div className="actions" style={{ justifyContent: 'center' }}>
          <Link className="btn" to="/books" style={{ textDecoration: 'none' }}>
            Buka Buku
          </Link>
          <Link className="btn ghost" to="/borrowings" style={{ textDecoration: 'none' }}>
            Lihat Peminjaman
          </Link>
        </div>
      )}
    </div>
  );
}

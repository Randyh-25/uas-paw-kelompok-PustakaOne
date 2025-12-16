import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { bookApi } from "../api/client";

export default function Dashboard() {
  const { user } = useAuth();

  const {
    data: booksData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["books", { limit: 5 }],
    queryFn: () => bookApi.list(),
    initialData: { items: [] },
  });

  const books = booksData?.items.slice(0, 5) || [];

  return (
    <div className="stack">
      <div className="card">
        <h1>Selamat Datang di PustakaOne</h1>
        <p>Kelola buku, pinjam, dan kembalikan dengan cepat.</p>
        <ul className="bullets">
          <li>Browse dan cari koleksi buku terbaru.</li>
          <li>Pinjam buku (maks 3) dan pantau status peminjaman Anda.</li>
          <li>Lakukan pengembalian dengan perhitungan denda otomatis jika terlambat.</li>
          <li>Lihat riwayat transaksi untuk Member dan kelola data untuk Librarian.</li>
        </ul>
        {!user ? (
          <div className="actions">
            <Link className="btn" to="/login">
              Login untuk Meminjam
            </Link>
            <Link className="btn ghost" to="/register">
              Daftar Akun Baru
            </Link>
          </div>
        ) : (
          <div className="actions">
            <Link className="btn" to="/books">
              Buka Koleksi Buku
            </Link>
            <Link className="btn ghost" to="/borrowings">
              Lihat Peminjaman Saya
            </Link>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Koleksi Terbaru</h2>
        {isLoading ? (
          <div>Memuat buku...</div>
        ) : isError ? (
          <div className="error">Gagal memuat koleksi buku.</div>
        ) : (
          <>
            <div className="list">
              {books.map((b) => (
                <div key={b.id} className="item">
                  <div>
                    <strong>{b.title}</strong>
                    <div className="muted">
                      {b.author} · {b.category}
                    </div>
                  </div>
                  <div className="muted">
                    Tersedia: {b.copies_available} / {b.copies_total}
                  </div>
                </div>
              ))}
            </div>
            <div className="actions" style={{ marginTop: "20px" }}>
              <Link className="btn ghost" to="/books">
                Lihat Semua Buku &rarr;
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { bookApi } from "../api/client";
import { useState, useEffect } from "react";

const quotes = [
  { text: "Today a reader, tomorrow a leader.", author: "Margaret Fuller" },
  { text: "A room without books is like a body without a soul.", author: "Marcus Tullius Cicero" },
  { text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.", author: "Dr. Seuss" },
  { text: "Reading is essential for those who seek to rise above the ordinary.", author: "Jim Rohn" },
  { text: "Books are a uniquely portable magic.", author: "Stephen King" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [quote, setQuote] = useState({ text: "", author: "" });

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

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
      <div className="card" style={{ textAlign: 'center', fontStyle: 'italic', backgroundColor: 'var(--bg-tertiary)' }}>
        <p style={{ fontSize: '1.1rem', margin: '0 0 8px 0' }}>"{quote.text}"</p>
        <footer style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>&mdash; {quote.author}</footer>
      </div>

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

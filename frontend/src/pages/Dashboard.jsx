import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { bookApi } from "../api/client";

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

  const { data: booksData, isLoading, isError } = useQuery({
    queryKey: ["books", { limit: 6 }],
    queryFn: () => bookApi.list(),
    initialData: { items: [] },
  });
  const books = booksData?.items.slice(0, 6) || [];
  const totalBooks = booksData?.items.length || 0;

  const stats = useMemo(() => {
    const items = booksData?.items || [];
    const totalCopies = items.reduce((sum, b) => sum + (b.copies_total || 0), 0);
    const availableCopies = items.reduce((sum, b) => sum + (b.copies_available || 0), 0);
    const borrowedCopies = Math.max(totalCopies - availableCopies, 0);
    const categories = items.reduce((acc, b) => {
      if (b.category) acc[b.category] = (acc[b.category] || 0) + 1;
      return acc;
    }, {});
    const topCategories = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));
    return { totalCopies, availableCopies, borrowedCopies, topCategories };
  }, [booksData]);

  const isGuest = !user;

  return (
    <div className="dashboard-container">
      {isGuest && (
        <div className="hero-section minimal-hero">
          <div className="hero-content">
            <h1 className="hero-title">PustakaOne</h1>
            <p className="hero-subtitle">
              Platform perpustakaan digital untuk mengelola dan meminjam koleksi.
            </p>
            <div className="hero-actions">
              <Link className="btn" to="/login">Masuk</Link>
              <Link className="btn ghost" to="/books">Lihat Koleksi</Link>
            </div>
          </div>
        </div>
      )}

      {!isGuest && (
        <div className="dashboard-grid">
          <div className="card dashboard-quick">
            <div>
              <h2>Ringkasan</h2>
              <p className="muted">Pantau stok dan aktivitas cepat.</p>
            </div>
            <div className="stat-chips">
              <div className="chip">{totalBooks} judul</div>
              <div className="chip">{stats.totalCopies} eksemplar</div>
              <div className="chip">{stats.availableCopies} tersedia</div>
              <div className="chip">{stats.borrowedCopies} dipinjam</div>
            </div>
          </div>

          <div className="card compact-card">
            <div className="section-header tight">
              <h3>Quick actions</h3>
              <p className="muted">Lakukan tindakan harian</p>
            </div>
            <div className="quick-actions">
              <Link className="btn" to="/books">Kelola buku</Link>
              <Link className="btn ghost" to="/borrowings">Peminjaman</Link>
              <Link className="btn ghost" to="/history">Riwayat</Link>
            </div>
          </div>

          <div className="card compact-card">
            <div className="section-header tight">
              <h3>Kategori teratas</h3>
              <p className="muted">3 kategori dengan judul terbanyak</p>
            </div>
            <div className="category-chips">
              {stats.topCategories.length === 0 ? (
                <p className="muted">Belum ada data kategori.</p>
              ) : (
                stats.topCategories.map((cat) => (
                  <span key={cat.name} className="chip hollow">{cat.name} · {cat.count}</span>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {isGuest && (
        <div className="quote-section">
          <div className="quote-content">
            <p className="quote-text">"{quote.text}"</p>
            <p className="quote-author">— {quote.author}</p>
          </div>
        </div>
      )}

      {/* Latest Books Section */}
      <div className="card">
        <div className="section-header">
          <h2>Koleksi Terbaru</h2>
          <Link to="/books" className="view-all-link">Lihat semua →</Link>
        </div>
        {isLoading ? (
          <div className="loading-state">Memuat koleksi buku...</div>
        ) : isError ? (
          <div className="error">Gagal memuat koleksi</div>
        ) : (
          <div className="books-grid compact">
            {books.map((b) => (
              <div key={b.id} className="book-card-compact mini">
                <div className="book-thumb small">
                  {b.cover_url ? (
                    <img src={b.cover_url} alt={b.title} onError={(e) => { e.target.style.display = "none"; }} />
                  ) : (
                    <span className="book-thumb-fallback">📘</span>
                  )}
                </div>
                <div className="book-card-main">
                  <div className="book-card-head">
                    <div>
                      <h3>{b.title}</h3>
                      <p className="muted">oleh {b.author}</p>
                    </div>
                    <span className={`status-badge ${b.copies_available > 0 ? "status-available" : "status-borrowed"}`}>
                      {b.copies_available > 0 ? "Tersedia" : "Dipinjam"}
                    </span>
                  </div>
                  <div className="book-card-meta">
                    <span>{b.category || "Tanpa kategori"}</span>
                    <span>ISBN {b.isbn}</span>
                    <span>{b.copies_available}/{b.copies_total} stok</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
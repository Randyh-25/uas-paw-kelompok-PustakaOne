import { useState, useEffect } from "react";
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

  return (
    <div className="dashboard-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Selamat Datang di PustakaOne</h1>
          <p className="hero-subtitle">
            Platform perpustakaan digital modern untuk mengelola dan meminjam koleksi buku
          </p>
          {!user ? (
            <div className="hero-actions">
              <Link className="btn btn-hero" to="/login">Mulai Sekarang</Link>
              <Link className="btn ghost btn-hero" to="/books">Jelajahi Koleksi</Link>
            </div>
          ) : (
            <div className="hero-actions">
              <Link className="btn btn-hero" to="/books">Jelajahi Buku</Link>
              <Link className="btn ghost btn-hero" to="/borrowings">Peminjaman Saya</Link>
            </div>
          )}
        </div>
      </div>

      {/* Quote Section */}
      <div className="quote-section">
        <div className="quote-content">
          <p className="quote-text">"{quote.text}"</p>
          <p className="quote-author">— {quote.author}</p>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-grid">
        <div className="feature-card">
          <h3>Koleksi Lengkap</h3>
          <p>Ribuan buku dari berbagai kategori siap untuk dipinjam</p>
        </div>
        <div className="feature-card">
          <h3>Pencarian Mudah</h3>
          <p>Temukan buku favorit dengan filter dan pencarian cepat</p>
        </div>
        <div className="feature-card">
          <h3>Pinjam Cepat</h3>
          <p>Sistem peminjaman otomatis dengan tracking real-time</p>
        </div>
        <div className="feature-card">
          <h3>Riwayat Lengkap</h3>
          <p>Pantau semua aktivitas peminjaman dan pengembalian</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stat-item">
          <div className="stat-value">{totalBooks}+</div>
          <div className="stat-label">Total Buku</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">14 Hari</div>
          <div className="stat-label">Durasi Pinjam</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">3 Buku</div>
          <div className="stat-label">Maks Pinjam</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">24/7</div>
          <div className="stat-label">Akses Online</div>
        </div>
      </div>

      {/* Latest Books Section */}
      <div className="card">
        <div className="section-header">
          <h2>Koleksi Terbaru</h2>
          <Link to="/books" className="view-all-link">Lihat Semua →</Link>
        </div>
        {isLoading ? (
          <div className="loading-state">Memuat koleksi buku...</div>
        ) : isError ? (
          <div className="error">Gagal memuat koleksi buku</div>
        ) : (
          <div className="books-grid">
            {books.map((b) => (
              <div key={b.id} className="book-card">
                <div className="book-header">
                  <h4 className="book-title">{b.title}</h4>
                  <span className={`availability-badge ${b.copies_available > 0 ? 'available' : 'unavailable'}`}>
                    {b.copies_available > 0 ? 'Tersedia' : 'Dipinjam'}
                  </span>
                </div>
                <p className="book-author">{b.author}</p>
                <p className="book-category">{b.category}</p>
                <div className="book-footer">
                  <span className="book-copies">
                    {b.copies_available}/{b.copies_total} tersedia
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
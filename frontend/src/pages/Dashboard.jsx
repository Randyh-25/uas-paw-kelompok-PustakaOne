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
        <div className="card dashboard-quick">
          <div>
            <h2>Ringkasan</h2>
            <p className="muted">Fokus ke data dan tugas harian.</p>
          </div>
          <div className="stat-chips">
            <div className="chip">{totalBooks} buku</div>
            <div className="chip">Masa pinjam 14 hari</div>
            <div className="chip">Maks 3 buku</div>
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
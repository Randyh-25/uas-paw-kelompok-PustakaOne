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
          <h1 className="hero-title">Welcome to LibraryOne</h1>
          <p className="hero-subtitle">
            Modern digital library platform to manage and borrow book collections
          </p>
          {!user ? (
            <div className="hero-actions">
              <Link className="btn btn-hero" to="/login">Get Started</Link>
              <Link className="btn ghost btn-hero" to="/books">Browse Collection</Link>
            </div>
          ) : (
            <div className="hero-actions">
              <Link className="btn btn-hero" to="/books">Browse Books</Link>
              <Link className="btn ghost btn-hero" to="/borrowings">My Borrowings</Link>
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
          <h3>Complete Collection</h3>
          <p>Thousands of books from various categories ready to borrow</p>
        </div>
        <div className="feature-card">
          <h3>Easy Search</h3>
          <p>Find your favorite books with quick filters and search</p>
        </div>
        <div className="feature-card">
          <h3>Quick Borrow</h3>
          <p>Automatic borrowing system with real-time tracking</p>
        </div>
        <div className="feature-card">
          <h3>Complete History</h3>
          <p>Monitor all borrowing and return activities</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stat-item">
          <div className="stat-value">{totalBooks}+</div>
          <div className="stat-label">Total Books</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">14 Days</div>
          <div className="stat-label">Borrow Period</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">3 Books</div>
          <div className="stat-label">Max Borrow</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">24/7</div>
          <div className="stat-label">Online Access</div>
        </div>
      </div>

      {/* Latest Books Section */}
      <div className="card">
        <div className="section-header">
          <h2>Latest Collection</h2>
          <Link to="/books" className="view-all-link">View All →</Link>
        </div>
        {isLoading ? (
          <div className="loading-state">Loading books collection...</div>
        ) : isError ? (
          <div className="error">Failed to load books collection</div>
        ) : (
          <div className="books-grid">
            {books.map((b) => (
              <div key={b.id} className="book-card">
                <div className="book-header">
                  <h4 className="book-title">{b.title}</h4>
                  <span className={`availability-badge ${b.copies_available > 0 ? 'available' : 'unavailable'}`}>
                    {b.copies_available > 0 ? 'Available' : 'Borrowed'}
                  </span>
                </div>
                <p className="book-author">{b.author}</p>
                <p className="book-category">{b.category}</p>
                <div className="book-footer">
                  <span className="book-copies">
                    {b.copies_available}/{b.copies_total} available
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
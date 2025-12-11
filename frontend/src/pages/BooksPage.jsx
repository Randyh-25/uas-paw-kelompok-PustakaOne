import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { bookApi, borrowApi } from "../api/client";
import { useAuth } from "../context/AuthContext";
import BookForm from "../components/BookForm";

export default function BooksPage() {
  const { token, user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [availability, setAvailability] = useState("all");
  const [sortBy, setSortBy] = useState("title");
  const [editing, setEditing] = useState(null);

  const isLibrarian = user?.role === "librarian";

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await bookApi.list({ search, category });
      setItems(res.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    let filteredItems = items;

    // Apply availability filter
    if (availability === "available") {
      filteredItems = filteredItems.filter(b => b.copies_available > 0);
    } else if (availability === "unavailable") {
      filteredItems = filteredItems.filter(b => b.copies_available === 0);
    }

    // Apply sorting
    filteredItems = [...filteredItems].sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "author":
          return a.author.localeCompare(b.author);
        case "category":
          return a.category.localeCompare(b.category);
        case "available":
          return b.copies_available - a.copies_available;
        default:
          return 0;
      }
    });

    return filteredItems;
  }, [items, availability, sortBy]);

  const handleCreate = async (data) => {
    try {
      await bookApi.create(token, data);
      setEditing(null);
      fetchBooks();
      toast.success("Book created successfully");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      await bookApi.update(token, id, data);
      setEditing(null);
      fetchBooks();
      toast.success("Book updated successfully");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete book?")) return;
    try {
      await bookApi.remove(token, id);
      fetchBooks();
      toast.success("Book deleted successfully");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleBorrow = async (id) => {
    try {
      await borrowApi.borrow(token, id);
      fetchBooks();
      toast.success("Book borrowed successfully");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="stack">
      <div className="card">
        <div style={{ marginBottom: '24px' }}>
          <h2>Book Catalog</h2>
          <p className="muted">Browse and manage our complete book collection</p>
        </div>

        <div className="filters">
          <input
            placeholder="Search by title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input
            placeholder="Filter by category..."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <select value={availability} onChange={(e) => setAvailability(e.target.value)}>
            <option value="all">All Books</option>
            <option value="available">Available Only</option>
            <option value="unavailable">Unavailable Only</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="title">Sort by Title</option>
            <option value="author">Sort by Author</option>
            <option value="category">Sort by Category</option>
            <option value="available">Sort by Availability</option>
          </select>
          <button className="btn" onClick={fetchBooks}>
            Search
          </button>
          {(search || category || availability !== "all") && (
            <button 
              className="btn ghost" 
              onClick={() => {
                setSearch("");
                setCategory("");
                setAvailability("all");
                setSortBy("title");
                fetchBooks();
              }}
            >
              Clear Filters
            </button>
          )}
          {isLibrarian && (
            <button 
              className="btn success" 
              onClick={() => setEditing({})}
              style={{ whiteSpace: 'nowrap' }}
            >
              Add New Book
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading">Loading books...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <h3>No Books Found</h3>
            <p>Try adjusting your search filters or add new books to the catalog.</p>
          </div>
        ) : (
          <>
            {/* Statistics */}
            <div style={{ 
              marginBottom: '20px', 
              padding: '16px', 
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
              borderRadius: '12px',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
                  {filtered.length}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Books Shown</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>
                  {filtered.filter(b => b.copies_available > 0).length}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Available</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>
                  {filtered.filter(b => b.copies_available === 0).length}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Unavailable</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#7c3aed' }}>
                  {filtered.reduce((sum, b) => sum + b.copies_available, 0)}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Total Copies</div>
              </div>
            </div>

            <div style={{ 
              marginBottom: '16px', 
              padding: '12px 16px', 
              background: '#f8fafc', 
              borderRadius: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontWeight: 600, color: '#1e293b' }}>
                Showing {filtered.length} book{filtered.length !== 1 ? 's' : ''}
              </span>
              <span className="muted">
                Total available: {filtered.reduce((sum, b) => sum + b.copies_available, 0)}
              </span>
            </div>

            <div className="list">
              {filtered.map((b) => (
                <div key={b.id} className="item">
                  <div className="book-info">
                    <div className="book-title">{b.title}</div>
                    <div className="book-details">
                      <div><strong>Author:</strong> {b.author}</div>
                      <div><strong>Category:</strong> {b.category}</div>
                      <div><strong>ISBN:</strong> {b.isbn}</div>
                    </div>
                    <div style={{ marginTop: '12px' }}>
                      {b.copies_available > 0 ? (
                        <div className="availability">
                          {b.copies_available} of {b.copies_total} available
                        </div>
                      ) : (
                        <div className="availability low">
                          Out of stock ({b.copies_total} total)
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="actions">
                    {isLibrarian && (
                      <>
                        <button className="btn ghost" onClick={() => setEditing(b)}>
                          Edit
                        </button>
                        <button className="btn danger" onClick={() => handleDelete(b.id)}>
                          Delete
                        </button>
                      </>
                    )}
                    {user && user.role === "member" && b.copies_available > 0 && (
                      <button className="btn success" onClick={() => handleBorrow(b.id)}>
                        Borrow Book
                      </button>
                    )}
                    {user && user.role === "member" && b.copies_available === 0 && (
                      <button className="btn" disabled>
                        Not Available
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {isLibrarian && editing && (
        <div className="card">
          <h3>{editing.id ? "✏️ Edit Book" : "➕ Add New Book"}</h3>
          <BookForm
            initial={editing.id ? editing : undefined}
            onSubmit={(data) => (editing.id ? handleUpdate(editing.id, data) : handleCreate(data))}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}
    </div>
  );
}

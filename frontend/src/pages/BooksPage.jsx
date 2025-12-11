import { useEffect, useMemo, useState } from "react";
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

  const filtered = useMemo(() => items, [items]);

  const handleCreate = async (data) => {
    try {
      await bookApi.create(token, data);
      setEditing(null);
      fetchBooks();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      await bookApi.update(token, id, data);
      setEditing(null);
      fetchBooks();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete book?")) return;
    try {
      await bookApi.remove(token, id);
      fetchBooks();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBorrow = async (id) => {
    try {
      await borrowApi.borrow(token, id);
      fetchBooks();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="stack">
      <div className="card">
        <h2>Books</h2>
        <div className="filters">
          <input
            placeholder="Search title/author"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <button className="btn ghost" onClick={fetchBooks}>
            Apply
          </button>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="list">
            {filtered.map((b) => (
              <div key={b.id} className="item">
                <div>
                  <strong>{b.title}</strong>
                  <div className="muted">
                    {b.author} · {b.category} · ISBN {b.isbn}
                  </div>
                  <div className="muted">
                    Available {b.copies_available}/{b.copies_total}
                  </div>
                </div>
                <div className="actions">
                  {isLibrarian && (
                    <>
                      <button className="ghost" onClick={() => setEditing(b)}>
                        Edit
                      </button>
                      <button className="ghost" onClick={() => handleDelete(b.id)}>
                        Delete
                      </button>
                    </>
                  )}
                  {user && user.role === "member" && b.copies_available > 0 && (
                    <button className="btn" onClick={() => handleBorrow(b.id)}>
                      Borrow
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isLibrarian && (
        <div className="card">
          <h3>{editing ? "Edit Book" : "Add Book"}</h3>
          <BookForm
            initial={editing || undefined}
            onSubmit={(data) => (editing ? handleUpdate(editing.id, data) : handleCreate(data))}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}
    </div>
  );
}

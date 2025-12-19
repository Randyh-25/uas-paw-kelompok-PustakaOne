import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookApi, borrowApi } from "../api/client";
import { useAuth } from "../context/AuthContext";
import BookForm from "../components/BookForm";

function PaginationControls({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="actions" style={{ marginTop: "20px", justifyContent: "center" }}>
      <button
        className="btn ghost"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        &larr; Previous
      </button>
      <span style={{ padding: "0 12px", color: "var(--text-secondary)" }}>
        Page {page} of {totalPages}
      </span>
      <button
        className="btn ghost"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next &rarr;
      </button>
    </div>
  );
}

export default function BooksPage() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);

  const isLibrarian = user?.role === "librarian";

  const queryParams = { search, category, page };

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["books", queryParams],
    queryFn: () => bookApi.list(queryParams),
    initialData: { items: [], total_pages: 1, page: 1 },
  });

  const createMutation = useMutation({
    mutationFn: (newData) => bookApi.create(token, newData),
    onSuccess: () => {
      toast.success("Book created successfully");
      setEditing(null);
      queryClient.invalidateQueries(["books"]);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => bookApi.update(token, id, data),
    onSuccess: () => {
      toast.success("Book updated successfully");
      setEditing(null);
      queryClient.invalidateQueries(["books"]);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => bookApi.remove(token, id),
    onSuccess: () => {
      toast.success("Book deleted successfully");
      queryClient.invalidateQueries(["books"]);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const borrowMutation = useMutation({
    mutationFn: (id) => borrowApi.borrow(token, id),
    onSuccess: () => {
      toast.success("Book borrowed successfully");
      queryClient.invalidateQueries(["books"]);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleDelete = (id) => {
    if (window.confirm("Delete book?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFilterChange = () => {
    setPage(1);
    queryClient.invalidateQueries(["books", { search, category, page: 1 }]);
  };

  const books = data?.items || [];
  const totalPages = data?.total_pages || 1;

  return (
    <div className="stack">
      <div className="books-page-header">
        <div>
          <h1>Book Collection</h1>
          <p className="books-subtitle">Discover and borrow your favorite books</p>
        </div>
        {isLibrarian && (
          <button className="btn" onClick={() => setEditing({})}>
            + Add New Book
          </button>
        )}
      </div>

      <div className="card books-filter-card">
        <div className="books-filters">
          <div className="filter-group">
            <label>🔍 Search Books</label>
            <input
              className="search-input"
              placeholder="Search title or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleFilterChange()}
            />
          </div>
          <div className="filter-group">
            <label>📚 Category</label>
            <input
              className="search-input"
              placeholder="Enter category..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleFilterChange()}
            />
          </div>
          <button className="btn" onClick={handleFilterChange}>
            Apply Filters
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-state">
          <div className="spinner-large"></div>
          <p>Loading book collection...</p>
        </div>
      ) : isError ? (
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <p>{error.message}</p>
        </div>
      ) : books.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📚</span>
          <h3>No books found</h3>
          <p>Try changing your search filters</p>
        </div>
      ) : (
        <>
          <div className="books-grid">
            {books.map((b) => (
              <div key={b.id} className="book-card-modern">
                <div className="book-cover">
                  <div className="book-cover-image">
                    {b.cover_url ? (
                      <img 
                        src={b.cover_url} 
                        alt={b.title} 
                        className="book-cover-img"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <span className="book-icon" style={b.cover_url ? {display: 'none'} : {}}>📖</span>
                    <div className="book-spine"></div>
                  </div>
                  {b.copies_available > 0 ? (
                    <span className="badge badge-available">Available</span>
                  ) : (
                    <span className="badge badge-unavailable">Borrowed</span>
                  )}
                </div>
                <div className="book-info">
                  <h3 className="book-title-modern">{b.title}</h3>
                  <p className="book-author-modern">oleh {b.author}</p>
                  <div className="book-meta">
                    <span className="meta-tag">{b.category}</span>
                    <span className="meta-isbn">ISBN: {b.isbn}</span>
                  </div>
                  <div className="book-availability">
                    <div className="availability-bar">
                      <div 
                        className="availability-fill" 
                        style={{width: `${(b.copies_available / b.copies_total) * 100}%`}}
                      ></div>
                    </div>
                    <span className="availability-text">
                      {b.copies_available} of {b.copies_total} available
                    </span>
                  </div>
                  <div className="book-actions">
                    {isLibrarian && (
                      <>
                        <button 
                          className="btn-icon btn-icon-edit" 
                          onClick={() => setEditing(b)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon btn-icon-delete"
                          onClick={() => handleDelete(b.id)}
                          disabled={deleteMutation.isPending}
                          title="Hapus"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                    {user && user.role === "member" && b.copies_available > 0 && (
                      <button
                        className="btn btn-borrow"
                        onClick={() => borrowMutation.mutate(b.id)}
                        disabled={borrowMutation.isPending}
                      >
                        Borrow Book
                      </button>
                    )}
                    {user && user.role === "member" && b.copies_available === 0 && (
                      <button className="btn btn-disabled" disabled>
                        Unavailable
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <PaginationControls
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      {isLibrarian && (
        <div className="card">
          <h3>{editing ? "Edit Book" : "Add Book"}</h3>
          <BookForm
            initial={editing || undefined}
            onSubmit={(data) =>
              editing
                ? updateMutation.mutate({ id: editing.id, data })
                : createMutation.mutate(data)
            }
            onCancel={() => setEditing(null)}
          />
        </div>
      )}
    </div>
  );
}

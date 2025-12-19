import { useEffect, useMemo, useState } from "react";
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
  const [editorBook, setEditorBook] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const isLibrarian = user?.role === "librarian";

  const queryParams = { search, category, page };

  const formId = editorBook?.id ? `book-form-${editorBook.id}` : "book-form-new";

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    if (isEditorOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = originalOverflow || "";
    }
    return () => {
      document.body.style.overflow = originalOverflow || "";
    };
  }, [isEditorOpen]);

  const openCreate = () => {
    setEditorBook(null);
    setIsEditorOpen(true);
  };

  const openEdit = (book) => {
    setEditorBook(book);
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditorBook(null);
  };

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

  const categoryOptions = useMemo(() => {
    return (data?.items || [])
      .map((b) => b.category)
      .filter(Boolean)
      .map((c) => c.trim())
      .filter(Boolean)
      .filter((c, idx, arr) => arr.indexOf(c) === idx)
      .sort((a, b) => a.localeCompare(b, "id", { sensitivity: "base" }));
  }, [data]);

  const createMutation = useMutation({
    mutationFn: (newData) => bookApi.create(token, newData),
    onSuccess: () => {
      toast.success("Book created successfully");
      closeEditor();
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
      closeEditor();
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

  const handleSubmit = (payload) => {
    if (editorBook?.id) {
      updateMutation.mutate({ id: editorBook.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const books = data?.items || [];
  const totalPages = data?.total_pages || 1;

  return (
    <div className="stack">
      <div className="books-page-header">
        <div>
          <h1>Koleksi Buku</h1>
          <p className="books-subtitle">Cari, kelola, dan pinjam buku</p>
        </div>
        {isLibrarian && (
          <button className="btn" onClick={openCreate}>+ Tambah Buku</button>
        )}
      </div>

      <div className="card books-filter-card">
        <div className="books-filters">
          <div className="filter-group">
            <label>Cari Buku</label>
            <input
              className="search-input"
              placeholder="Judul atau penulis"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleFilterChange()}
            />
          </div>
          <div className="filter-group">
            <label>Kategori</label>
            <input
              className="search-input"
              placeholder="Masukkan kategori"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleFilterChange()}
            />
          </div>
          <button className="btn" onClick={handleFilterChange}>
            Terapkan
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
          <div className="books-grid compact">
            {books.map((b) => (
              <div key={b.id} className="book-card-compact">
                <div className="book-thumb">
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
                <div className="book-card-actions">
                  {isLibrarian && (
                    <>
                      <button 
                        className="btn ghost"
                        onClick={() => openEdit(b)}
                        title="Edit"
                      >
                        Edit
                      </button>
                      <button
                        className="btn ghost"
                        onClick={() => handleDelete(b.id)}
                        disabled={deleteMutation.isPending}
                        title="Hapus"
                      >
                        Hapus
                      </button>
                    </>
                  )}
                  {user && user.role === "member" && b.copies_available > 0 && (
                    <button
                      className="btn"
                      onClick={() => borrowMutation.mutate(b.id)}
                      disabled={borrowMutation.isPending}
                    >
                      Pinjam
                    </button>
                  )}
                  {user && user.role === "member" && b.copies_available === 0 && (
                    <button className="btn ghost" disabled>
                      Tidak tersedia
                    </button>
                  )}
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
      {isEditorOpen && (
        <div className="modal-backdrop" onClick={closeEditor}>
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-label={editorBook?.id ? "Edit buku" : "Tambah buku"}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">Kelola Buku</p>
                <h2 style={{ margin: "4px 0 6px 0" }}>{editorBook?.id ? "Edit Buku" : "Tambah Buku"}</h2>
                <p className="muted">Lengkapi data judul, identitas, dan stok koleksi.</p>
              </div>
              <div className="modal-header-actions">
                <div className="editor-badges" style={{ alignItems: "center" }}>
                  <span className="chip">{editorBook?.id ? "Mode edit" : "Mode tambah"}</span>
                  {editorBook?.id && <span className="chip hollow">ID {editorBook.id}</span>}
                </div>
                <div className="modal-header-buttons">
                  <button className="btn ghost" type="button" onClick={closeEditor}>
                    Batal
                  </button>
                  <button className="btn" type="submit" form={formId}>
                    Simpan
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-body">
              <div className="card editor-card">
                <BookForm
                  initial={editorBook || undefined}
                  onSubmit={handleSubmit}
                  onCancel={closeEditor}
                  formId={formId}
                  categories={categoryOptions}
                  showActions={false}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import BookForm from "../components/BookForm";
import { bookApi } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function BookEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { token, user } = useAuth();
  const queryClient = useQueryClient();

  const initial = state?.book || null;
  const isEdit = Boolean(id);

  const createMutation = useMutation({
    mutationFn: (data) => bookApi.create(token, data),
    onSuccess: () => {
      toast.success("Buku berhasil dibuat");
      queryClient.invalidateQueries(["books"]);
      navigate("/books", { replace: true });
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => bookApi.update(token, id, data),
    onSuccess: () => {
      toast.success("Buku diperbarui");
      queryClient.invalidateQueries(["books"]);
      navigate("/books", { replace: true });
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (data) => {
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  useEffect(() => {
    if (!user) return; // ProtectedRoute already handles auth
    if (user.role !== "librarian") {
      toast.error("Hanya pustakawan yang dapat mengelola buku");
      navigate("/books", { replace: true });
    }
  }, [user, navigate]);

  if (isEdit && !initial) {
    return (
      <div className="editor-page">
        <div className="card narrow">
          <p className="error">Data buku tidak ditemukan. Kembali ke daftar.</p>
          <button className="btn" onClick={() => navigate("/books")}>Kembali</button>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-page">
      <div className="editor-header">
        <div>
          <p className="eyebrow">Kelola Buku</p>
          <h1 className="editor-title">{isEdit ? "Edit Buku" : "Tambah Buku"}</h1>
          <p className="muted">Lengkapi data judul, identitas, dan stok koleksi.</p>
        </div>
        <div className="editor-badges">
          <span className="chip">{isEdit ? "Mode edit" : "Mode tambah"}</span>
          {isEdit && id && <span className="chip hollow">ID {id}</span>}
        </div>
      </div>

      <div className="card editor-card">
        <BookForm
          initial={initial || undefined}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/books")}
        />
      </div>
    </div>
  );
}

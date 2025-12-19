import { useState } from "react";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { borrowApi } from "../api/client";
import { useAuth } from "../context/AuthContext";

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

export default function BorrowingsPage() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();

  const [activeOnly, setActiveOnly] = useState(true);
  const [memberId, setMemberId] = useState("");
  const [page, setPage] = useState(1);

  const queryParams = {
    active: activeOnly,
    member_id: user.role === "librarian" && memberId ? memberId : undefined,
    page,
  };

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["borrowings", queryParams],
    queryFn: () => borrowApi.listBorrowings(token, queryParams),
    initialData: { items: [], total_pages: 1, page: 1 },
  });

  const returnMutation = useMutation({
    mutationFn: (id) => borrowApi.returnBook(token, id),
    onSuccess: () => {
      toast.success("Book returned successfully");
      queryClient.invalidateQueries(["borrowings"]);
      queryClient.invalidateQueries(["books"]); // Also invalidate books query
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleFilterChange = () => {
    setPage(1);
    // No need to call refetch, changing state will trigger it
  };

  const items = data?.items || [];
  const totalPages = data?.total_pages || 1;

  const formatDate = (value) => value ? new Date(value).toLocaleDateString("id-ID") : "-";
  const statusInfo = (row) => {
    if (row.return_date) return { label: "Dikembalikan", className: "status-done" };
    const overdue = row.due_date && new Date(row.due_date) < new Date();
    return overdue
      ? { label: "Terlambat", className: "status-borrowed" }
      : { label: "Dipinjam", className: "status-available" };
  };
  const daysLeft = (row) => {
    if (!row.due_date) return "-";
    const diff = Math.ceil((new Date(row.due_date) - new Date()) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? `${diff} hari lagi` : `${Math.abs(diff)} hari terlambat`;
  };

  return (
    <div className="card">
      <h2>Peminjaman</h2>
      <div className="filters">
        <label className="inline">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
          />
          Hanya aktif
        </label>
        {user.role === "librarian" && (
          <input
            placeholder="ID Anggota (opsional)"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
          />
        )}
        <button className="btn ghost" onClick={handleFilterChange}>
          Muat ulang
        </button>
      </div>
      {isLoading ? (
        <div>Memuat...</div>
      ) : isError ? (
        <div className="error">{error.message}</div>
      ) : (
        <>
          <div className="table-card">
            <div className="table header">
              <span>Judul</span>
              <span>Peminjam</span>
              <span>Tanggal</span>
              <span>Status</span>
              <span>Aksi</span>
            </div>
            {items.map((b) => {
              const st = statusInfo(b);
              return (
                <div key={b.id} className="table row">
                  <div>
                    <div className="strong">{b.book.title}</div>
                    <div className="muted">oleh {b.book.author}</div>
                  </div>
                  <div className="muted">{b.member_id || "-"}</div>
                  <div className="muted">
                    Pinjam {formatDate(b.borrow_date)}<br />
                    Jatuh tempo {formatDate(b.due_date)}<br />
                    <span className="muted">{daysLeft(b)}</span>
                  </div>
                  <span className={`status-badge ${st.className}`}>{st.label}</span>
                  <div className="table-actions">
                    {!b.return_date && (
                      <button
                        className="btn ghost"
                        onClick={() => returnMutation.mutate(b.id)}
                        disabled={returnMutation.isPending}
                      >
                        Tandai kembali
                      </button>
                    )}
                    {b.fine > 0 && <div className="error">Denda: {b.fine}</div>}
                  </div>
                </div>
              );
            })}
          </div>
          <PaginationControls
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}

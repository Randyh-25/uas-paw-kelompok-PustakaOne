import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { borrowApi } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function HistoryPage() {
  const { token, user } = useAuth();
  const [memberId, setMemberId] = useState("");

  const isLibrarian = user.role === "librarian";

  const queryParams = {
    member_id: isLibrarian && memberId ? memberId : undefined,
  };

  const {
    data: historyData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["history", queryParams],
    queryFn: () => borrowApi.history(token, queryParams),
    initialData: { items: [] },
  });

  const items = historyData?.items || [];
  const formatDate = (value) => value ? new Date(value).toLocaleDateString("id-ID") : "-";
  const statusInfo = (row) => {
    if (!row.return_date) return { label: "Dipinjam", className: "status-available" };
    const overdue = row.due_date && new Date(row.due_date) < new Date(row.return_date);
    return overdue ? { label: "Terlambat", className: "status-borrowed" } : { label: "Dikembalikan", className: "status-done" };
  };

  return (
    <div className="card">
      <h2>Riwayat</h2>
      <div className="filters">
        {isLibrarian && (
          <input
            placeholder="ID Anggota (opsional)"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
          />
        )}
        <button className="btn ghost" onClick={() => refetch()}>
          Muat ulang
        </button>
      </div>
      {isLoading ? (
        <div>Memuat...</div>
      ) : isError ? (
        <div className="error">{error.message}</div>
      ) : (
        <div className="table-card">
          <div className="table header">
            <span>Judul</span>
            <span>Peminjam</span>
            <span>Tanggal</span>
            <span>Status</span>
            <span>Denda</span>
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
                  Kembali {formatDate(b.return_date)}
                </div>
                <span className={`status-badge ${st.className}`}>{st.label}</span>
                <div className="muted">{b.fine > 0 ? `Denda ${b.fine}` : "-"}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

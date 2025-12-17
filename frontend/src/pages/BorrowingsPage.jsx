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

  return (
    <div className="card">
      <h2>Borrowings</h2>
      <div className="filters">
        <label className="inline">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
          />
          Active only
        </label>
        {user.role === "librarian" && (
          <input
            placeholder="Member ID (optional)"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
          />
        )}
        <button className="btn ghost" onClick={handleFilterChange}>
          Refresh
        </button>
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : isError ? (
        <div className="error">{error.message}</div>
      ) : (
        <>
          <div className="list">
            {items.map((b) => (
              <div key={b.id} className="item">
                <div>
                  <strong>{b.book.title}</strong> by {b.book.author}
                  <div className="muted">
                    Borrowed: {b.borrow_date} · Due: {b.due_date}
                  </div>
                  <div className="muted">Borrowing ID: {b.id}</div>
                  {b.return_date && <div className="muted">Returned: {b.return_date}</div>}
                  {b.fine > 0 && <div className="error">Fine: {b.fine}</div>}
                </div>
                <div className="actions">
                  {!b.return_date && (
                    <button
                      className="btn ghost"
                      onClick={() => returnMutation.mutate(b.id)}
                      disabled={returnMutation.isPending}
                    >
                      Mark Returned
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
    </div>
  );
}

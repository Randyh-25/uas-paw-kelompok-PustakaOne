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

  return (
    <div className="card">
      <h2>History</h2>
      <div className="filters">
        {isLibrarian && (
          <input
            placeholder="Member ID (optional)"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
          />
        )}
        <button className="btn ghost" onClick={() => refetch()}>
          Refresh
        </button>
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : isError ? (
        <div className="error">{error.message}</div>
      ) : (
        <div className="list">
          {items.map((b) => (
            <div key={b.id} className="item">
              <div>
                <strong>{b.book.title}</strong> by {b.book.author}
                <div className="muted">
                  Borrow: {b.borrow_date} · Due: {b.due_date}
                </div>
                <div className="muted">Returned: {b.return_date || "Not yet"}</div>
                {b.fine > 0 && <div className="error">Fine: {b.fine}</div>}
              </div>
              <div className="muted">Member ID: {b.member_id}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

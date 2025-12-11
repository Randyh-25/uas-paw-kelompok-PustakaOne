import { useEffect, useState } from "react";
import { borrowApi } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function BorrowingsPage() {
  const { token, user } = useAuth();
  const [items, setItems] = useState([]);
  const [activeOnly, setActiveOnly] = useState(true);
  const [memberId, setMemberId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await borrowApi.listBorrowings(token, {
        active: activeOnly,
        member_id: user.role === "librarian" && memberId ? memberId : undefined,
      });
      setItems(res.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReturn = async (id) => {
    try {
      await borrowApi.returnBook(token, id);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

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
        <button className="btn ghost" onClick={fetchData}>
          Refresh
        </button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
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
                  <button className="btn ghost" onClick={() => handleReturn(b.id)}>
                    Mark Returned
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

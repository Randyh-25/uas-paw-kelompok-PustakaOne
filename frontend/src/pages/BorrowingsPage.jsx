import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { borrowApi } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function BorrowingsPage() {
  const { token, user } = useAuth();
  const [items, setItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState("active");
  const [memberId, setMemberId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set());

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        member_id: user.role === "librarian" && memberId ? memberId : undefined,
      };

      if (statusFilter === "active") {
        params.active = true;
      } else if (statusFilter === "returned") {
        params.active = false;
      }
      // For "all", don't set active parameter

      const res = await borrowApi.listBorrowings(token, params);
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
    if (!window.confirm("Confirm return of this book?")) return;
    try {
      await borrowApi.returnBook(token, id);
      fetchData();
      toast.success("Book returned successfully!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleBulkReturn = async () => {
    if (selectedItems.size === 0) {
      toast.error("Please select books to return");
      return;
    }
    if (!window.confirm(`Confirm return of ${selectedItems.size} book(s)?`)) return;

    try {
      const promises = Array.from(selectedItems).map(id => borrowApi.returnBook(token, id));
      await Promise.all(promises);
      setSelectedItems(new Set());
      fetchData();
      toast.success(`${selectedItems.size} book(s) returned successfully!`);
    } catch (err) {
      toast.error("Some returns failed: " + err.message);
    }
  };

  const toggleSelection = (id) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const isOverdue = (dueDate, returnDate) => {
    if (returnDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return dueDate < today;
  };

  return (
    <div className="card">
      <div style={{ marginBottom: '24px' }}>
        <h2>Active Borrowings</h2>
        <p className="muted">Manage and track all book borrowings</p>
      </div>

      <div className="filters">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="active">Active Borrowings</option>
          <option value="overdue">Overdue Only</option>
          <option value="returned">Returned Books</option>
          <option value="all">All Borrowings</option>
        </select>
        {user.role === "librarian" && (
          <input
            placeholder="Filter by Member ID"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
          />
        )}
        <button className="btn ghost" onClick={fetchData}>
          Refresh
        </button>
        {user.role === "librarian" && statusFilter === "active" && items.length > 0 && (
          <button 
            className="btn success" 
            onClick={handleBulkReturn}
            disabled={selectedItems.size === 0}
            style={{ whiteSpace: 'nowrap' }}
          >
            Return Selected ({selectedItems.size})
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading">Loading borrowings...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <h3>No Borrowings Found</h3>
          <p>No borrowing records match your current filters.</p>
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '16px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
                {items.length}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Total Records</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>
                {items.filter(b => !b.return_date).length}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Active</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>
                {items.filter(b => !b.return_date && isOverdue(b.due_date, b.return_date)).length}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Overdue</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#7c3aed' }}>
                {items.filter(b => b.return_date).length}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Returned</div>
            </div>
          </div>

          <div className="list">
          {items.map((b) => (
            <div key={b.id} className="item" style={{
              borderColor: !b.return_date && isOverdue(b.due_date, b.return_date) ? '#dc2626' : undefined,
              borderWidth: !b.return_date && isOverdue(b.due_date, b.return_date) ? '2px' : undefined,
              position: 'relative'
            }}>
              {user.role === "librarian" && !b.return_date && (
                <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10 }}>
                  <input
                    type="checkbox"
                    checked={selectedItems.has(b.id)}
                    onChange={() => toggleSelection(b.id)}
                    style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                  />
                </div>
              )}
              <div className="book-info">
                <div className="book-title">{b.book.title}</div>
                <div className="book-details">
                  <div>Author: {b.book.author}</div>
                  <div>Borrowed: {b.borrow_date}</div>
                  <div>Due: {b.due_date}</div>
                  {b.return_date && (
                    <div>Returned: {b.return_date}</div>
                  )}
                  <div className="muted">ID: #{b.id}</div>
                </div>
                <div className="inline" style={{ marginTop: '12px' }}>
                  {!b.return_date && isOverdue(b.due_date, b.return_date) && (
                    <span className="badge danger">OVERDUE</span>
                  )}
                  {!b.return_date && !isOverdue(b.due_date, b.return_date) && (
                    <span className="badge success">Active</span>
                  )}
                  {b.return_date && (
                    <span className="badge primary">Returned</span>
                  )}
                  {b.fine > 0 && (
                    <span className="badge warning">Fine: Rp {b.fine.toLocaleString()}</span>
                  )}
                </div>
              </div>
              <div className="actions">
                {!b.return_date && (
                  <button 
                    className="btn success" 
                    onClick={() => handleReturn(b.id)}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    Mark Returned
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>      </>      )}
    </div>
  );
}

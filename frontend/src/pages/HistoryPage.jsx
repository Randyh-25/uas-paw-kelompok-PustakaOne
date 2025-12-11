import { useEffect, useState, useMemo } from "react";
import { borrowApi } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function HistoryPage() {
  const { token, user } = useAuth();
  const [items, setItems] = useState([]);
  const [memberId, setMemberId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("borrow_date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await borrowApi.history(token, {
        member_id: user.role === "librarian" && memberId ? memberId : undefined,
      });
      setItems(res.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    let filtered = items;

    // Date filtering
    if (startDate) {
      filtered = filtered.filter(item => item.borrow_date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(item => item.borrow_date <= endDate);
    }

    // Sorting
    filtered = [...filtered].sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case "borrow_date":
          aValue = new Date(a.borrow_date);
          bValue = new Date(b.borrow_date);
          break;
        case "return_date":
          aValue = a.return_date ? new Date(a.return_date) : new Date("9999-12-31");
          bValue = b.return_date ? new Date(b.return_date) : new Date("9999-12-31");
          break;
        case "title":
          aValue = a.book.title.toLowerCase();
          bValue = b.book.title.toLowerCase();
          break;
        case "fine":
          aValue = a.fine || 0;
          bValue = b.fine || 0;
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [items, startDate, endDate, sortBy, sortOrder]);

  const exportToCSV = () => {
    const headers = ["ID", "Book Title", "Author", "Member ID", "Borrow Date", "Due Date", "Return Date", "Fine"];
    const csvData = filteredItems.map(item => [
      item.id,
      item.book.title,
      item.book.author,
      item.member_id,
      item.borrow_date,
      item.due_date,
      item.return_date || "",
      item.fine || 0
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `borrowing_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="card">
      <div style={{ marginBottom: '24px' }}>
        <h2>Borrowing History</h2>
        <p className="muted">Complete history of all book transactions</p>
      </div>

      <div className="filters">
        {user.role === "librarian" && (
          <input
            placeholder="Filter by Member ID"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
          />
        )}
        <input
          type="date"
          placeholder="Start Date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          placeholder="End Date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="borrow_date">Sort by Borrow Date</option>
          <option value="return_date">Sort by Return Date</option>
          <option value="title">Sort by Title</option>
          <option value="fine">Sort by Fine</option>
        </select>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
        <button className="btn ghost" onClick={fetchData}>
          Refresh
        </button>
        {filteredItems.length > 0 && (
          <button className="btn success" onClick={exportToCSV} style={{ whiteSpace: 'nowrap' }}>
            Export CSV
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading">Loading history...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : filteredItems.length === 0 ? (
        <div className="empty-state">
          <h3>No History Found</h3>
          <p>No borrowing history matches your current filters.</p>
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
                {filteredItems.length}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Total Records</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>
                {filteredItems.filter(b => b.return_date).length}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Returned</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>
                {filteredItems.filter(b => b.fine > 0).length}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>With Fines</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#7c3aed' }}>
                Rp {filteredItems.reduce((sum, b) => sum + (b.fine || 0), 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Total Fines</div>
            </div>
          </div>

          <div className="list">
            {filteredItems.map((b) => {
            const isReturned = !!b.return_date;
            const hasFine = b.fine > 0;
            
            return (
              <div key={b.id} className="item">
                <div className="book-info">
                  <div className="book-title">{b.book.title}</div>
                  <div className="book-details">
                    <div>Author: {b.book.author}</div>
                    <div>Borrowed: {b.borrow_date}</div>
                    <div>Due Date: {b.due_date}</div>
                    <div style={{ 
                      color: isReturned ? '#059669' : '#dc2626',
                      fontWeight: 500 
                    }}>
                      {isReturned ? `Returned: ${b.return_date}` : 'Not returned yet'}
                    </div>
                    {user.role === "librarian" && (
                      <div className="muted">Member ID: {b.member_id}</div>
                    )}
                    <div className="muted">ID: #{b.id}</div>
                  </div>
                  <div className="inline" style={{ marginTop: '12px' }}>
                    {isReturned ? (
                      <span className="badge success">Completed</span>
                    ) : (
                      <span className="badge warning">Pending Return</span>
                    )}
                    {hasFine && (
                      <span className="badge danger">Fine: Rp {b.fine.toLocaleString()}</span>
                    )}
                    {!hasFine && isReturned && (
                      <span className="badge primary">No Fine</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          </div>
          
          <div style={{ 
            marginTop: '32px', 
            padding: '20px', 
            background: '#f8fafc', 
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <div className="inline">
              <span style={{ fontWeight: 600, color: '#1e293b' }}>
                Filtered Records: {filteredItems.length}
              </span>
              <span className="muted">•</span>
              <span className="muted">
                Returned: {filteredItems.filter(b => b.return_date).length}
              </span>
              <span className="muted">•</span>
              <span className="muted">
                Pending: {filteredItems.filter(b => !b.return_date).length}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

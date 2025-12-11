import { useState } from "react";

export default function BookForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(
    initial || {
      title: "",
      author: "",
      isbn: "",
      category: "",
      copies_total: 1,
      copies_available: 1,
    }
  );

  const submit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form className="form grid" onSubmit={submit}>
      <input
        placeholder="Title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        required
      />
      <input
        placeholder="Author"
        value={form.author}
        onChange={(e) => setForm({ ...form, author: e.target.value })}
        required
      />
      <input
        placeholder="ISBN"
        value={form.isbn}
        onChange={(e) => setForm({ ...form, isbn: e.target.value })}
        required
      />
      <input
        placeholder="Category"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
        required
      />
      <input
        type="number"
        min={1}
        placeholder="Total"
        value={form.copies_total}
        onChange={(e) => setForm({ ...form, copies_total: Number(e.target.value) })}
        required
      />
      <input
        type="number"
        min={0}
        placeholder="Available"
        value={form.copies_available}
        onChange={(e) => setForm({ ...form, copies_available: Number(e.target.value) })}
        required
      />
      <div className="actions">
        <button className="btn" type="submit">
          Save
        </button>
        {onCancel && (
          <button className="btn ghost" type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

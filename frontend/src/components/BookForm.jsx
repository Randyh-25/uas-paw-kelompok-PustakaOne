import { useEffect } from "react";
import { useForm } from "react-hook-form";

export default function BookForm({ initial, onSubmit, onCancel }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: initial || {
      title: "",
      author: "",
      isbn: "",
      category: "",
      copies_total: 1,
      copies_available: 1,
    },
  });

  useEffect(() => {
    reset(
      initial || {
        title: "",
        author: "",
        isbn: "",
        category: "",
        copies_total: 1,
        copies_available: 1,
      }
    );
  }, [initial, reset]);

  return (
    <form className="form grid" onSubmit={handleSubmit(onSubmit)}>
      <div className="form-group">
        <input
          placeholder="Title"
          {...register("title", { required: "Title is required" })}
        />
        {errors.title && <span className="error">{errors.title.message}</span>}
      </div>
      <div className="form-group">
        <input
          placeholder="Author"
          {...register("author", { required: "Author is required" })}
        />
        {errors.author && <span className="error">{errors.author.message}</span>}
      </div>
      <div className="form-group">
        <input
          placeholder="ISBN"
          {...register("isbn", { required: "ISBN is required" })}
        />
        {errors.isbn && <span className="error">{errors.isbn.message}</span>}
      </div>
      <div className="form-group">
        <input
          placeholder="Category"
          {...register("category", { required: "Category is required" })}
        />
        {errors.category && <span className="error">{errors.category.message}</span>}
      </div>
      <div className="form-group">
        <input
          type="number"
          min={1}
          placeholder="Total"
          {...register("copies_total", {
            required: "Total copies is required",
            valueAsNumber: true,
            min: { value: 1, message: "Must be at least 1" },
          })}
        />
        {errors.copies_total && (
          <span className="error">{errors.copies_total.message}</span>
        )}
      </div>
      <div className="form-group">
        <input
          type="number"
          min={0}
          placeholder="Available"
          {...register("copies_available", {
            required: "Available copies is required",
            valueAsNumber: true,
            min: { value: 0, message: "Cannot be negative" },
          })}
        />
        {errors.copies_available && (
          <span className="error">{errors.copies_available.message}</span>
        )}
      </div>
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

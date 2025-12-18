import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function BookForm({ initial, onSubmit, onCancel }) {
  const [previewImage, setPreviewImage] = useState(initial?.cover_image_url || "");
  const [isDragging, setIsDragging] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: initial || {
      title: "",
      author: "",
      isbn: "",
      category: "",
      copies_total: 1,
      copies_available: 1,
      cover_image_url: "",
    },
  });

  const processImageFile = (file) => {
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      alert("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      console.log("Image loaded, size:", reader.result.length, "bytes");
      setPreviewImage(reader.result);
      setValue("cover_image_url", reader.result);
      console.log("Cover image URL set:", reader.result.substring(0, 100) + "...");
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    processImageFile(file);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processImageFile(files[0]);
    }
  };

  const handleIncrement = (field, min = 0) => {
    const currentValue = watch(field) || 0;
    setValue(field, currentValue + 1);
  };

  const handleDecrement = (field, min = 0) => {
    const currentValue = watch(field) || 0;
    if (currentValue > min) {
      setValue(field, currentValue - 1);
    }
  };

  useEffect(() => {
    const defaultValues = initial || {
      title: "",
      author: "",
      isbn: "",
      category: "",
      copies_total: 1,
      copies_available: 1,
      cover_image_url: "",
    };
    reset(defaultValues);
    setPreviewImage(initial?.cover_image_url || "");
  }, [initial, reset]);

  const handleFormSubmit = (data) => {
    console.log("Form submitted with data:", {
      ...data,
      cover_image_url: data.cover_image_url ? data.cover_image_url.substring(0, 100) + "..." : "empty"
    });
    onSubmit(data);
  };

  return (
    <form className="form grid" onSubmit={handleSubmit(handleFormSubmit)}>
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
      <div className="form-group" style={{ gridColumn: "1 / -1" }}>
        <label>
          <span>Book Cover Image (optional)</span>
          <div className="image-upload-container">
            <div 
              className={`drop-zone ${isDragging ? 'dragging' : ''}`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
                id="cover-image-upload"
              />
              <div className="drop-zone-content">
                <div className="drop-zone-icon">📷</div>
                <label htmlFor="cover-image-upload" className="upload-button">
                  Choose Image
                </label>
                <p className="drop-zone-text">or drag and drop image here</p>
              </div>
            </div>
            {previewImage && (
              <div className="image-preview">
                <img src={previewImage} alt="Book cover preview" />
                <button 
                  type="button" 
                  className="remove-image-btn"
                  onClick={() => {
                    setPreviewImage("");
                    setValue("cover_image_url", "");
                    document.getElementById('cover-image-upload').value = "";
                  }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </label>
        <small style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          Upload a book cover image (Max 5MB, JPG/PNG)
        </small>
        <input type="hidden" {...register("cover_image_url")} />
      </div>
      <div className="form-group">
        <label>
          <span>Total Copies</span>
          <div className="number-input-wrapper">
            <button
              type="button"
              className="number-btn decrement"
              onClick={() => handleDecrement("copies_total", 1)}
            >
              −
            </button>
            <input
              type="number"
              min={1}
              className="number-input"
              {...register("copies_total", {
                required: "Total copies is required",
                valueAsNumber: true,
                min: { value: 1, message: "Must be at least 1" },
              })}
            />
            <button
              type="button"
              className="number-btn increment"
              onClick={() => handleIncrement("copies_total", 1)}
            >
              +
            </button>
          </div>
        </label>
        {errors.copies_total && (
          <span className="error">{errors.copies_total.message}</span>
        )}
      </div>
      <div className="form-group">
        <label>
          <span>Available Copies</span>
          <div className="number-input-wrapper">
            <button
              type="button"
              className="number-btn decrement"
              onClick={() => handleDecrement("copies_available", 0)}
            >
              −
            </button>
            <input
              type="number"
              min={0}
              className="number-input"
              {...register("copies_available", {
                required: "Available copies is required",
                valueAsNumber: true,
                min: { value: 0, message: "Cannot be negative" },
              })}
            />
            <button
              type="button"
              className="number-btn increment"
              onClick={() => handleIncrement("copies_available", 0)}
            >
              +
            </button>
          </div>
        </label>
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

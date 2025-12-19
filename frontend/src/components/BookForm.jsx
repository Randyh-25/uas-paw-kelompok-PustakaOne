import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { cloudinaryApi } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function BookForm({ initial, onSubmit, onCancel }) {
  const [previewImage, setPreviewImage] = useState(initial?.cover_url || "");
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { token } = useAuth();
  
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
      cover_url: "",
    },
  });

  const processImageFile = async (file) => {
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
    reader.onloadend = async () => {
      const base64Image = reader.result;
      setPreviewImage(base64Image);
      
      // Upload to Cloudinary
      try {
        setUploading(true);
        const result = await cloudinaryApi.uploadImage(token, base64Image);
        console.log("Image uploaded to Cloudinary:", result.url);
        setValue("cover_url", result.url);
      } catch (error) {
        console.error("Failed to upload image:", error);
        alert("Failed to upload image: " + error.message);
        setPreviewImage("");
      } finally {
        setUploading(false);
      }
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
      cover_url: "",
    };
    reset(defaultValues);
    setPreviewImage(initial?.cover_url || "");
  }, [initial, reset]);

  const handleFormSubmit = (data) => {
    if (uploading) {
      alert("Please wait for image upload to complete");
      return;
    }
    console.log("Form submitted with data:", {
      ...data,
      cover_url: data.cover_url ? data.cover_url.substring(0, 100) + "..." : "empty"
    });
    onSubmit(data);
  };

  return (
    <form className="form grid book-form" onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="form-group">
        <input
          placeholder="Judul"
          {...register("title", { required: "Judul wajib diisi" })}
        />
        {errors.title && <span className="error">{errors.title.message}</span>}
      </div>
      <div className="form-group">
        <input
          placeholder="Penulis"
          {...register("author", { required: "Penulis wajib diisi" })}
        />
        {errors.author && <span className="error">{errors.author.message}</span>}
      </div>
      <div className="form-group">
        <input
          placeholder="ISBN"
          {...register("isbn", { required: "ISBN wajib diisi" })}
        />
        {errors.isbn && <span className="error">{errors.isbn.message}</span>}
      </div>
      <div className="form-group">
        <input
          placeholder="Kategori"
          {...register("category", { required: "Kategori wajib diisi" })}
        />
        {errors.category && <span className="error">{errors.category.message}</span>}
      </div>
      <div className="form-group" style={{ gridColumn: "1 / -1" }}>
        <label>
          <span>Sampul buku (opsional)</span>
          <div className="image-upload-container">
            <div 
              className={`drop-zone ${isDragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
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
                disabled={uploading}
              />
              <div className="drop-zone-content">
                {uploading ? (
                  <>
                    <div className="drop-zone-icon">⏳</div>
                    <p className="drop-zone-text">Mengunggah ke Cloudinary...</p>
                  </>
                ) : (
                  <>
                    <div className="drop-zone-icon">📷</div>
                    <label htmlFor="cover-image-upload" className="upload-button">
                      Pilih gambar
                    </label>
                    <p className="drop-zone-text">atau seret dan lepas di sini</p>
                  </>
                )}
              </div>
            </div>
            {previewImage && !uploading && (
              <div className="image-preview">
                <img src={previewImage} alt="Book cover preview" />
                <button 
                  type="button" 
                  className="remove-image-btn"
                  onClick={() => {
                    setPreviewImage("");
                    setValue("cover_url", "");
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
          Unggah sampul (maks 5MB, JPG/PNG) - dikirim ke Cloudinary
        </small>
        <input type="hidden" {...register("cover_url")} />
      </div>
      <div className="form-group">
        <label>
          <span>Total eksemplar</span>
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
          <span>Eksemplar tersedia</span>
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
          Simpan
        </button>
        {onCancel && (
          <button className="btn ghost" type="button" onClick={onCancel}>
            Batal
          </button>
        )}
      </div>
    </form>
  );
}

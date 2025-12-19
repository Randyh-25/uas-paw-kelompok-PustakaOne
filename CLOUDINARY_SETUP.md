# Cloudinary Book Cover Upload Implementation

## Overview
This implementation adds book cover upload functionality using Cloudinary CDN for your library management system.

## Cloudinary Configuration
- **Cloud Name:** pengweb
- **API Key:** 836274215195383
- **API Secret:** gWernKn9YC_qcuz7Mg3Qtn6s_2g

## Changes Made

### Backend Changes

#### 1. Dependencies
- Added `cloudinary==1.36.0` to `requirements.txt`

#### 2. Database Model (`app/models/book.py`)
- Added `cover_url` field to Book model (String(500), nullable)

#### 3. New Cloudinary Upload View (`app/views/cloudinary_upload.py`)
- New endpoint: `POST /api/cloudinary/upload`
- Requires librarian authentication
- Accepts base64 image data
- Uploads to Cloudinary folder: `library_books`
- Returns Cloudinary secure URL

#### 4. Updated Book Views (`app/views/books.py`)
- Added `cover_url` to `serialize_book()` function
- Updated `create_book()` to accept `cover_url`
- Updated `update_book()` to allow updating `cover_url`

#### 5. Routes (`app/routes.py`)
- Added route: `cloudinary.upload` -> `/api/cloudinary/upload`

#### 6. Database Migration (`alembic/versions/0002_add_cover_url.py`)
- Migration to add `cover_url` column to books table

### Frontend Changes

#### 1. API Client (`src/api/client.js`)
- Added `cloudinaryApi.uploadImage()` function

#### 2. BookForm Component (`src/components/BookForm.jsx`)
- Updated to use `cover_url` instead of `cover_image_url`
- Added Cloudinary upload on image selection
- Shows "Uploading to Cloudinary..." during upload
- Prevents form submission while uploading
- Stores Cloudinary URL in form data

#### 3. BooksPage (`src/pages/BooksPage.jsx`)
- Updated to display `cover_url` instead of `cover_image_url`

## Setup Instructions

### 1. Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Run Database Migration
```bash
cd backend
alembic upgrade head
```

This will add the `cover_url` column to your existing books table.

### 3. Restart Backend Server
```bash
cd backend
pserve development.ini --reload
```

### 4. Frontend (if needed)
The frontend changes are already in place. Just ensure your development server is running:
```bash
cd frontend
npm run dev
```

## How It Works

### Upload Flow:
1. **Admin selects image** (drag & drop or file picker)
2. **Image preview** shows immediately
3. **Automatic upload** to Cloudinary in background
4. **Cloudinary URL** is stored in form
5. **Form submission** saves book with Cloudinary URL
6. **Book display** loads cover from Cloudinary CDN

### Features:
- ✅ Drag & drop image upload
- ✅ File picker upload
- ✅ Image preview before upload
- ✅ Upload progress indicator
- ✅ Automatic upload to Cloudinary
- ✅ Image validation (type & size)
- ✅ Max 5MB file size
- ✅ Supports JPG, PNG, JPEG, GIF, WEBP
- ✅ Stored in Cloudinary folder: `library_books`
- ✅ Secure HTTPS URLs
- ✅ CDN delivery for fast loading

## Testing

### As a Librarian:
1. Log in with librarian account
2. Go to Books page
3. Click "Add New Book"
4. Fill in book details
5. Upload a cover image (drag & drop or click)
6. Wait for "Uploading to Cloudinary..." to finish
7. Submit the form
8. Verify the book cover displays correctly

### Update Existing Book:
1. Click edit (✏️) on a book
2. Upload a new cover image
3. Submit to update

## Security Notes
- Only librarians can upload images
- Images are validated before upload
- Cloudinary credentials are in backend only (not exposed to frontend)
- All uploads go to dedicated folder: `library_books`
- HTTPS secure URLs

## Troubleshooting

### If upload fails:
- Check network connection
- Verify Cloudinary credentials
- Check browser console for errors
- Ensure image is under 5MB
- Verify image format (JPG/PNG)

### If image doesn't display:
- Check Cloudinary dashboard for uploaded images
- Verify `cover_url` is saved in database
- Check browser console for CORS errors
- Ensure Cloudinary URL is accessible

## Cloudinary Dashboard
View uploaded images at: https://cloudinary.com/console/c-{account_id}/media_library/folders/library_books

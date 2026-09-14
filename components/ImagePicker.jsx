'use client';

import { useState } from 'react';

// Reads a File object and resolves to a base64 data-URI string.
// This is what lets us both preview the image instantly (no server round-trip
// needed to see it) and later send that same string to save in MongoDB.
function fileToDataUri(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const MAX_IMAGES = 5;

export default function ImagePicker({ images, onChange }) {
  const [previewIndex, setPreviewIndex] = useState(null);
  const [error, setError] = useState(null);

  const handleFilesSelected = async (e) => {
    const files = Array.from(e.target.files);
    e.target.value = '';
    setError(null);

    if (images.length + files.length > MAX_IMAGES) {
      setError(`You can upload up to ${MAX_IMAGES} photos total.`);
      return;
    }

    try {
      const dataUris = await Promise.all(files.map(fileToDataUri));
      onChange([...images, ...dataUris]);
    } catch (err) {
      console.error(err);
      setError('Failed to read one of the selected files.');
    }
  };

  const removeImage = (index) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-3">
        {images.map((src, index) => (
          <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 group">
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setPreviewIndex(index)}
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-0 right-0 bg-black/70 text-white text-xs w-5 h-5 flex items-center justify-center rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove photo"
            >
              ×
            </button>
          </div>
        ))}

        {images.length < MAX_IMAGES && (
          <label className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 dark:text-gray-500 text-2xl cursor-pointer hover:border-gray-500 dark:hover:border-gray-400 transition-colors">
            +
            <input type="file" accept="image/*" multiple onChange={handleFilesSelected} className="hidden" />
          </label>
        )}
      </div>

      {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
      <p className="text-xs text-gray-500 dark:text-gray-400">Click a photo to preview it larger. Up to {MAX_IMAGES} photos.</p>

      {previewIndex !== null && images[previewIndex] && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6"
          onClick={() => setPreviewIndex(null)}
        >
          <img
            src={images[previewIndex]}
            alt=""
            className="max-w-full max-h-full rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setPreviewIndex(null)}
            className="absolute top-6 right-6 text-white text-2xl w-10 h-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70"
            aria-label="Close preview"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
import { useState } from 'react';
import api from '../api/client';

export default function AddListingForm({ onListingCreated, onCancel }) {
  const [formData, setFormData] = useState({
    title: '', description: '', rent: '', state: '', district: '',
    city: '', pincode: '', bedrooms: '', bathrooms: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file)); // local preview before upload
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // FormData is the browser's built-in way to build a multipart request body —
    // works with both text fields and files in one object.
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    if (imageFile) data.append('image', imageFile); // field name must match upload.single('image') on the backend

    try {
      const response = await api.post('/listings', data);
      onListingCreated(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 md:p-6 mb-6 dark:border-gray-700 flex flex-col gap-3">
      <h3 className="font-bold text-lg mb-2">Add a new listing</h3>

      {error && <p className="text-red-600">{error}</p>}

      <input name="title" type="text" placeholder="Title" value={formData.title} onChange={handleChange} required
        className="border rounded-lg p-2 dark:border-gray-700 dark:bg-gray-800" />

      <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required rows={3}
        className="border rounded-lg p-2 dark:border-gray-700 dark:bg-gray-800" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <input name="rent" type="number" placeholder="Rent (₹/month)" value={formData.rent} onChange={handleChange} required
          className="border rounded-lg p-2 dark:border-gray-700 dark:bg-gray-800" />
        <input name="bedrooms" type="number" placeholder="Bedrooms" value={formData.bedrooms} onChange={handleChange} required
          className="border rounded-lg p-2 dark:border-gray-700 dark:bg-gray-800" />
        <input name="bathrooms" type="number" placeholder="Bathrooms" value={formData.bathrooms} onChange={handleChange} required
          className="border rounded-lg p-2 dark:border-gray-700 dark:bg-gray-800" />
        <input name="pincode" type="text" placeholder="Pincode" value={formData.pincode} onChange={handleChange} required
          className="border rounded-lg p-2 dark:border-gray-700 dark:bg-gray-800" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input name="state" type="text" placeholder="State" value={formData.state} onChange={handleChange} required
          className="border rounded-lg p-2 dark:border-gray-700 dark:bg-gray-800" />
        <input name="district" type="text" placeholder="District" value={formData.district} onChange={handleChange} required
          className="border rounded-lg p-2 dark:border-gray-700 dark:bg-gray-800" />
        <input name="city" type="text" placeholder="City / Town / Village" value={formData.city} onChange={handleChange} required
          className="border rounded-lg p-2 dark:border-gray-700 dark:bg-gray-800" />
      </div>

      <div>
        <label className="block mb-2 font-medium">Photo</label>
        {/* accept="image/*" is what makes phones show gallery + camera + file browser automatically */}
        <input type="file" accept="image/*" onChange={handleImageChange}
          className="block w-full text-sm dark:text-gray-300" />
        {preview && (
          <img src={preview} alt="Preview" className="mt-3 w-full h-48 object-cover rounded-lg" />
        )}
      </div>

      <div className="flex gap-3 mt-2">
        <button type="submit" disabled={submitting}
          className="bg-black text-white dark:bg-white dark:text-black rounded-lg px-4 py-2 font-semibold disabled:opacity-50">
          {submitting ? 'Posting...' : 'Post listing'}
        </button>
        <button type="button" onClick={onCancel}
          className="border rounded-lg px-4 py-2 font-semibold dark:border-gray-700">
          Cancel
        </button>
      </div>
    </form>
  );
}
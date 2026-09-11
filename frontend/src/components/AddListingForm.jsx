import { useState } from 'react';
import api from '../api/client';

export default function AddListingForm({ onListingCreated, onCancel }) {
  const [formData, setFormData] = useState({
    title: '', description: '', rent: '', state: '', district: '',
    city: '', pincode: '', bedrooms: '', bathrooms: '',
  });
  const [images, setImages] = useState([]); // array of { file, previewUrl }
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const newImages = newFiles.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
    setImages((prev) => [...prev, ...newImages]); // append, don't replace
    e.target.value = ''; // allows picking the same file again if removed and re-added
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    images.forEach((img) => data.append('images', img.file)); // same field name, repeated = array on the backend

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
    <form onSubmit={handleSubmit} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 md:p-6 mb-6 flex flex-col gap-4">
      <h3 className="font-heading font-bold text-lg">Add a new listing</h3>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <input name="title" type="text" placeholder="Title" value={formData.title} onChange={handleChange} required
        className="border border-gray-200 dark:border-gray-700 dark:bg-[#15171A] rounded-md p-2.5 text-sm focus:outline-none focus:border-accent" />

      <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required rows={3}
        className="border border-gray-200 dark:border-gray-700 dark:bg-[#15171A] rounded-md p-2.5 text-sm focus:outline-none focus:border-accent" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <input name="rent" type="number" placeholder="Rent (₹/month)" value={formData.rent} onChange={handleChange} required
          className="border border-gray-200 dark:border-gray-700 dark:bg-[#15171A] rounded-md p-2.5 text-sm focus:outline-none focus:border-accent" />
        <input name="bedrooms" type="number" placeholder="Bedrooms" value={formData.bedrooms} onChange={handleChange} required
          className="border border-gray-200 dark:border-gray-700 dark:bg-[#15171A] rounded-md p-2.5 text-sm focus:outline-none focus:border-accent" />
        <input name="bathrooms" type="number" placeholder="Bathrooms" value={formData.bathrooms} onChange={handleChange} required
          className="border border-gray-200 dark:border-gray-700 dark:bg-[#15171A] rounded-md p-2.5 text-sm focus:outline-none focus:border-accent" />
        <input name="pincode" type="text" placeholder="Pincode" value={formData.pincode} onChange={handleChange} required
          className="border border-gray-200 dark:border-gray-700 dark:bg-[#15171A] rounded-md p-2.5 text-sm focus:outline-none focus:border-accent" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input name="state" type="text" placeholder="State" value={formData.state} onChange={handleChange} required
          className="border border-gray-200 dark:border-gray-700 dark:bg-[#15171A] rounded-md p-2.5 text-sm focus:outline-none focus:border-accent" />
        <input name="district" type="text" placeholder="District" value={formData.district} onChange={handleChange} required
          className="border border-gray-200 dark:border-gray-700 dark:bg-[#15171A] rounded-md p-2.5 text-sm focus:outline-none focus:border-accent" />
        <input name="city" type="text" placeholder="City / Town / Village" value={formData.city} onChange={handleChange} required
          className="border border-gray-200 dark:border-gray-700 dark:bg-[#15171A] rounded-md p-2.5 text-sm focus:outline-none focus:border-accent" />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium">Photos</label>

        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {images.map((img, index) => (
              <div key={index} className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 group">
                <img src={img.previewUrl} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 flex items-center justify-center rounded-full bg-black/70 text-white text-xs leading-none opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <label className="inline-flex items-center gap-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 cursor-pointer hover:border-accent transition-colors w-fit">
          + Add photos
          <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
        </label>
      </div>

      <div className="flex gap-3 mt-1">
        <button type="submit" disabled={submitting}
          className="bg-accent text-white rounded-md px-4 py-2.5 text-sm font-semibold hover:bg-accent-dark transition-colors disabled:opacity-50">
          {submitting ? 'Posting...' : 'Post listing'}
        </button>
        <button type="button" onClick={onCancel}
          className="border border-gray-200 dark:border-gray-700 rounded-md px-4 py-2.5 text-sm font-semibold hover:border-accent transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/apiClient';
import ImagePicker from '@/components/ImagePicker';

const inputClass = "border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100";

export default function EditListing() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    api.get(`/listings/${id}`)
      .then((response) => {
        const l = response.data;
        setForm({
          title: l.title, description: l.description, rent: l.rent,
          state: l.state, district: l.district, city: l.city, pincode: l.pincode,
          bedrooms: l.bedrooms, bathrooms: l.bathrooms,
          images: l.images || [],
        });
      })
      .catch((err) => {
        console.error(err);
        setError('Could not load this listing.');
      });
  }, [id, router]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleImagesChange = (images) => setForm({ ...form, images });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await api.put(`/listings/${id}`, form);
      router.push(`/listings/${id}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.delete(`/listings/${id}`);
      router.push('/');
    } catch (err) {
      console.error(err);
      setError('Failed to delete listing');
      setDeleting(false);
    }
  };

  if (error && !form) return <p className="p-8 text-red-600 dark:text-red-400">{error}</p>;
  if (!form) return <p className="p-8">Loading...</p>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit listing</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required className={inputClass} />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required className={inputClass} />

        <div className="grid grid-cols-2 gap-3">
          <input name="rent" type="number" placeholder="Rent (�/month)" value={form.rent} onChange={handleChange} required className={inputClass} />
          <input name="state" placeholder="State" value={form.state} onChange={handleChange} required className={inputClass} />
          <input name="district" placeholder="District" value={form.district} onChange={handleChange} required className={inputClass} />
          <input name="city" placeholder="City" value={form.city} onChange={handleChange} required className={inputClass} />
          <input name="pincode" placeholder="Pincode" value={form.pincode} onChange={handleChange} required className={inputClass} />
          <input name="bedrooms" type="number" placeholder="Bedrooms" value={form.bedrooms} onChange={handleChange} required className={inputClass} />
          <input name="bathrooms" type="number" placeholder="Bathrooms" value={form.bathrooms} onChange={handleChange} required className={inputClass} />
        </div>

        <ImagePicker images={form.images} onChange={handleImagesChange} />

        {error && <p className="text-red-600 dark:text-red-400">{error}</p>}

        <div className="flex gap-3 mt-2">
          <button type="submit" disabled={saving} className="bg-black dark:bg-white text-white dark:text-black rounded-lg px-4 py-2 font-semibold disabled:opacity-50">
            {saving ? 'Saving...' : 'Save changes'}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="border border-red-500 text-red-600 dark:text-red-400 rounded-lg px-4 py-2 font-semibold disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete listing'}
          </button>
        </div>
      </form>
    </div>
  );
}
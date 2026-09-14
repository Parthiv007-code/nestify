'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/apiClient';

const inputClass = "border border-gray-300 dark:border-gray-600 rounded-lg p-3 w-full mt-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100";
const labelClass = "text-sm font-semibold text-gray-700 dark:text-gray-300";

export default function Settings() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', state: '', district: '', city: '', pincode: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    api.get('/users/me')
      .then((response) => {
        const u = response.data;
        setForm({
          name: u.name,
          state: u.state || '',
          district: u.district || '',
          city: u.city || '',
          pincode: u.pincode || '',
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load your profile');
        setLoading(false);
      });
  }, [router]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await api.patch('/users/me', form);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-8">Loading...</p>;

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className={labelClass}>
          Name
          <input name="name" type="text" value={form.name} onChange={handleChange} className={inputClass} />
        </label>

        <label className={labelClass}>
          State
          <input name="state" type="text" value={form.state} onChange={handleChange} className={inputClass} />
        </label>

        <label className={labelClass}>
          District
          <input name="district" type="text" value={form.district} onChange={handleChange} className={inputClass} />
        </label>

        <label className={labelClass}>
          City / Town / Village
          <input name="city" type="text" value={form.city} onChange={handleChange} className={inputClass} />
        </label>

        <label className={labelClass}>
          Pincode
          <input name="pincode" type="text" value={form.pincode} onChange={handleChange} className={inputClass} />
        </label>

        {error && <p className="text-red-600 dark:text-red-400">{error}</p>}
        {success && <p className="text-green-600 dark:text-green-400">Saved!</p>}

        <button type="submit" disabled={saving} className="bg-black dark:bg-white text-white dark:text-black rounded-lg p-3 font-semibold disabled:opacity-50">
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
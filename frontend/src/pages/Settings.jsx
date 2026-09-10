import { useState, useEffect } from 'react';
import api from '../api/client';
import { useDarkMode } from '../hooks/useDarkMode';

export default function Settings() {
  const [isDark, setIsDark] = useDarkMode();

  const [form, setForm] = useState({ name: '', state: '', district: '', city: '', pincode: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
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
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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

  const inputClass = "border rounded-lg p-3 w-full mt-1 dark:bg-gray-800 dark:text-white dark:border-gray-600";
  const labelClass = "text-sm font-semibold dark:text-gray-200";

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">Settings</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-10">
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

        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">Saved!</p>}

        <button type="submit" disabled={saving} className="bg-black text-white rounded-lg p-3 font-semibold disabled:opacity-50 dark:bg-white dark:text-black">
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>

      <div className="flex items-center justify-between border-t pt-6 dark:border-gray-700">
        <span className="font-semibold dark:text-white">Dark mode</span>
        <button onClick={() => setIsDark(!isDark)} className="border rounded-full px-4 py-2 dark:border-gray-600 dark:text-white">
          {isDark ? '🌙 Dark' : '☀️ Light'}
        </button>
      </div>
    </div>
  );
}
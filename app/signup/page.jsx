'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/apiClient';

const inputClass = "border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500";

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    state: '', district: '', city: '', pincode: '',
    role: 'RENTER',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await api.post('/auth/signup', form);
      localStorage.setItem('token', response.data.token);
      router.push('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">Sign up</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input name="name" type="text" placeholder="Full name" value={form.name} onChange={handleChange} required className={inputClass} />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className={inputClass} />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required className={inputClass} />

        <div className="grid grid-cols-2 gap-3">
          <input name="state" type="text" placeholder="State" value={form.state} onChange={handleChange} required className={inputClass} />
          <input name="district" type="text" placeholder="District" value={form.district} onChange={handleChange} required className={inputClass} />
          <input name="city" type="text" placeholder="City / Town / Village" value={form.city} onChange={handleChange} className={inputClass} />
          <input name="pincode" type="text" placeholder="Pincode" value={form.pincode} onChange={handleChange} className={inputClass} />
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input type="radio" name="role" value="RENTER" checked={form.role === 'RENTER'} onChange={handleChange} />
            I&apos;m renting
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="role" value="OWNER" checked={form.role === 'OWNER'} onChange={handleChange} />
            I&apos;m an owner
          </label>
        </div>

        {error && <p className="text-red-600 dark:text-red-400">{error}</p>}

        <button type="submit" disabled={loading} className="bg-black dark:bg-white text-white dark:text-black rounded-lg p-3 font-semibold disabled:opacity-50">
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Already have an account? <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">Log in</Link>
      </p>
    </div>
  );
}
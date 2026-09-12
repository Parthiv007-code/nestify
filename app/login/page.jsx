'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/apiClient';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await api.post('/auth/login', form);
      localStorage.setItem('token', response.data.token);
      router.push('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">Log in</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className="border rounded-lg p-3" />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required className="border rounded-lg p-3" />

        {error && <p className="text-red-600">{error}</p>}

        <button type="submit" disabled={loading} className="bg-black text-white rounded-lg p-3 font-semibold disabled:opacity-50">
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-600">
        Don&apos;t have an account? <Link href="/signup" className="text-blue-600 hover:underline">Sign up</Link>
      </p>
    </div>
  );
}
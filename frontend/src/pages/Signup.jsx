import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    state: '',
    district: '',
    city: '',
    pincode: '',
    role: 'RENTER',
  });
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
      const response = await api.post('/auth/signup', form);
      localStorage.setItem('token', response.data.token);
      navigate('/');
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
        <input
          name="name" type="text" placeholder="Full name"
          value={form.name} onChange={handleChange} required
          className="border rounded-lg p-3"
        />
        <input
          name="email" type="email" placeholder="Email"
          value={form.email} onChange={handleChange} required
          className="border rounded-lg p-3"
        />
        <input
          name="password" type="password" placeholder="Password"
          value={form.password} onChange={handleChange} required
          className="border rounded-lg p-3"
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            name="state" type="text" placeholder="State"
            value={form.state} onChange={handleChange} required
            className="border rounded-lg p-3"
          />
          <input
            name="district" type="text" placeholder="District"
            value={form.district} onChange={handleChange} required
            className="border rounded-lg p-3"
          />
          <input
            name="city" type="text" placeholder="City / Town / Village"
            value={form.city} onChange={handleChange} required
            className="border rounded-lg p-3"
          />
          <input
            name="pincode" type="text" placeholder="Pincode"
            value={form.pincode} onChange={handleChange} required
            className="border rounded-lg p-3"
          />
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input type="radio" name="role" value="RENTER" checked={form.role === 'RENTER'} onChange={handleChange} />
            I'm renting
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="role" value="OWNER" checked={form.role === 'OWNER'} onChange={handleChange} />
            I'm an owner
          </label>
        </div>

        {error && <p className="text-red-600">{error}</p>}

        <button type="submit" disabled={loading} className="bg-black text-white rounded-lg p-3 font-semibold disabled:opacity-50">
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-600">
        Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Log in</Link>
      </p>
    </div>
  );
}
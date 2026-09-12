'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/apiClient';

function ListingCard({ listing }) {
  return (
    <Link href={`/listings/${listing._id}`} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
      {listing.imageUrl && (
        <img src={listing.imageUrl} alt={listing.title} className="w-full h-48 object-cover" />
      )}
      <div className="p-4">
        <h3 className="font-semibold text-lg">{listing.title}</h3>
        <p className="text-gray-600">{listing.city}, {listing.district}, {listing.state} — {listing.pincode}</p>
        <p className="mt-2 font-bold">₹{listing.rent}/month</p>
        <p className="text-sm text-gray-500">{listing.bedrooms} bed · {listing.bathrooms} bath</p>
      </div>
    </Link>
  );
}

function AddListingForm({ onCreated, onCancel }) {
  const [form, setForm] = useState({
    title: '', description: '', rent: '', state: '', district: '', city: '', pincode: '',
    bedrooms: '', bathrooms: '', imageUrl: '',
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const response = await api.post('/listings', form);
      onCreated(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to create listing');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 mb-6 flex flex-col gap-3">
      <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required className="border rounded-lg p-2" />
      <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required className="border rounded-lg p-2" />
      <div className="grid grid-cols-2 gap-3">
        <input name="rent" type="number" placeholder="Rent (₹/month)" value={form.rent} onChange={handleChange} required className="border rounded-lg p-2" />
        <input name="imageUrl" placeholder="Image URL (optional)" value={form.imageUrl} onChange={handleChange} className="border rounded-lg p-2" />
        <input name="state" placeholder="State" value={form.state} onChange={handleChange} required className="border rounded-lg p-2" />
        <input name="district" placeholder="District" value={form.district} onChange={handleChange} required className="border rounded-lg p-2" />
        <input name="city" placeholder="City" value={form.city} onChange={handleChange} required className="border rounded-lg p-2" />
        <input name="pincode" placeholder="Pincode" value={form.pincode} onChange={handleChange} required className="border rounded-lg p-2" />
        <input name="bedrooms" type="number" placeholder="Bedrooms" value={form.bedrooms} onChange={handleChange} required className="border rounded-lg p-2" />
        <input name="bathrooms" type="number" placeholder="Bathrooms" value={form.bathrooms} onChange={handleChange} required className="border rounded-lg p-2" />
      </div>
      {error && <p className="text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="bg-black text-white rounded-lg px-4 py-2 font-semibold disabled:opacity-50">
          {saving ? 'Posting...' : 'Post listing'}
        </button>
        <button type="button" onClick={onCancel} className="border rounded-lg px-4 py-2 font-semibold">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function Home() {
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [ownerListings, setOwnerListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setCheckedAuth(true);
      fetchListings({});
      return;
    }

    api.get('/users/me')
      .then((response) => {
        const me = response.data;
        setUser(me);
        setCheckedAuth(true);
        fetchListings(me.city ? { city: me.city } : {});

        if (me.role === 'OWNER') {
          api.get('/listings/mine').then((res) => setOwnerListings(res.data)).catch(console.error);
        }
      })
      .catch((err) => {
        console.error(err);
        localStorage.removeItem('token');
        setCheckedAuth(true);
        fetchListings({});
      });
  }, []);

  const fetchListings = (filters) => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    api.get(`/listings?${params.toString()}`)
      .then((response) => {
        setListings(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setOwnerListings([]);
    fetchListings({});
  };

  if (!checkedAuth) return <p className="p-8">Loading...</p>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {user ? `Welcome, ${user.name}` : 'Available Listings'}
        </h1>
        {user && (
          <button onClick={handleLogout} className="text-red-600 font-semibold hover:underline">
            Log out
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading listings...</p>
      ) : listings.length === 0 ? (
        <p className="text-gray-600 mb-12">No listings found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {listings.map((listing) => <ListingCard key={listing._id} listing={listing} />)}
        </div>
      )}

      {user?.role === 'OWNER' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Your Listings</h2>
            <button onClick={() => setShowAddForm(!showAddForm)} className="border rounded-lg px-4 py-2 font-semibold">
              {showAddForm ? 'Cancel' : '+ Add listing'}
            </button>
          </div>

          {showAddForm && (
            <AddListingForm
              onCreated={(newListing) => {
                setOwnerListings([newListing, ...ownerListings]);
                setShowAddForm(false);
              }}
              onCancel={() => setShowAddForm(false)}
            />
          )}

          {ownerListings.length === 0 ? (
            <p className="text-gray-600">You haven&apos;t posted any listings yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ownerListings.map((listing) => <ListingCard key={listing._id} listing={listing} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
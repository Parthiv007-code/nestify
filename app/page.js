'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/apiClient';
import ImagePicker from '@/components/ImagePicker';

function ListingCard({ listing, isOwner, onDeleted }) {
  const handleDelete = async (e) => {
    e.preventDefault();
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    try {
      await api.delete(`/listings/${listing._id}`);
      onDeleted(listing._id);
    } catch (err) {
      console.error(err);
      alert('Failed to delete listing');
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg dark:hover:border-gray-500 transition">
      <Link href={`/listings/${listing._id}`}>
        {listing.images?.[0] && (
          <img src={listing.images[0]} alt={listing.title} className="w-full h-48 object-cover" />
        )}
        <div className="p-4">
          <h3 className="font-semibold text-lg">{listing.title}</h3>
          <p className="text-gray-600 dark:text-gray-400">{listing.city}, {listing.district}, {listing.state} — {listing.pincode}</p>
          <p className="mt-2 font-bold">₹{listing.rent}/month</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{listing.bedrooms} bed · {listing.bathrooms} bath</p>
        </div>
      </Link>
      {isOwner && (
        <div className="flex gap-2 px-4 pb-4">
          <Link href={`/listings/${listing._id}/edit`} className="text-sm font-semibold border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 hover:border-gray-500 dark:hover:border-gray-400">
            Edit
          </Link>
          <button onClick={handleDelete} className="text-sm font-semibold border border-red-400 text-red-600 dark:text-red-400 rounded-lg px-3 py-1">
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

const inputClass = "border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100";

function AddListingForm({ onCreated, onCancel }) {
  const [form, setForm] = useState({
    title: '', description: '', rent: '', state: '', district: '', city: '', pincode: '',
    bedrooms: '', bathrooms: '', images: [],
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleImagesChange = (images) => setForm({ ...form, images });

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
    <form onSubmit={handleSubmit} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6 flex flex-col gap-3">
      <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required className={inputClass} />
      <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required className={inputClass} />
      <div className="grid grid-cols-2 gap-3">
        <input name="rent" type="number" placeholder="Rent (₹/month)" value={form.rent} onChange={handleChange} required className={inputClass} />
        <input name="state" placeholder="State" value={form.state} onChange={handleChange} required className={inputClass} />
        <input name="district" placeholder="District" value={form.district} onChange={handleChange} required className={inputClass} />
        <input name="city" placeholder="City" value={form.city} onChange={handleChange} required className={inputClass} />
        <input name="pincode" placeholder="Pincode" value={form.pincode} onChange={handleChange} required className={inputClass} />
        <input name="bedrooms" type="number" placeholder="Bedrooms" value={form.bedrooms} onChange={handleChange} required className={inputClass} />
        <input name="bathrooms" type="number" placeholder="Bathrooms" value={form.bathrooms} onChange={handleChange} required className={inputClass} />
      </div>

      <ImagePicker images={form.images} onChange={handleImagesChange} />

      {error && <p className="text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="bg-black dark:bg-white text-white dark:text-black rounded-lg px-4 py-2 font-semibold disabled:opacity-50">
          {saving ? 'Posting...' : 'Post listing'}
        </button>
        <button type="button" onClick={onCancel} className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 font-semibold">
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

  const handleOwnerListingDeleted = (deletedId) => {
    setOwnerListings(ownerListings.filter((l) => l._id !== deletedId));
  };

  if (!checkedAuth) return <p className="p-8">Loading...</p>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {user ? `Welcome, ${user.name}` : 'Available Listings'}
        </h1>
        {user && (
          <button onClick={handleLogout} className="text-red-600 dark:text-red-400 font-semibold hover:underline">
            Log out
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading listings...</p>
      ) : listings.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400 mb-12">No listings found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {listings.map((listing) => <ListingCard key={listing._id} listing={listing} isOwner={false} />)}
        </div>
      )}

      {user?.role === 'OWNER' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Your Listings</h2>
            <button onClick={() => setShowAddForm(!showAddForm)} className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 font-semibold">
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
            <p className="text-gray-600 dark:text-gray-400">You haven&apos;t posted any listings yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ownerListings.map((listing) => (
                <ListingCard key={listing._id} listing={listing} isOwner={true} onDeleted={handleOwnerListingDeleted} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
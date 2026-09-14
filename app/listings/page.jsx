'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/apiClient';

function ListingCard({ listing }) {
  return (
    <Link href={`/listings/${listing._id}`} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg dark:hover:border-gray-500 transition">
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
  );
}

const inputClass = "border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500";

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    state: '', district: '', city: '', pincode: '', minRent: '', maxRent: '', bedrooms: '',
  });

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const fetchListings = (activeFilters) => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    api.get(`/listings?${params.toString()}`)
      .then((response) => {
        setListings(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load listings');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchListings({});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchListings(filters);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Search Listings</h1>

      <form onSubmit={handleSearch} className="flex flex-wrap gap-3 mb-8">
        <input name="state" type="text" placeholder="State" value={filters.state} onChange={handleFilterChange} required className={inputClass} />
        <input name="district" type="text" placeholder="District" value={filters.district} onChange={handleFilterChange} required className={inputClass} />
        <input name="city" type="text" placeholder="City / Town / Village" value={filters.city} onChange={handleFilterChange} className={inputClass} />
        <input name="pincode" type="text" placeholder="Pincode" value={filters.pincode} onChange={handleFilterChange} className={`${inputClass} w-28`} />
        <input name="minRent" type="number" placeholder="Min rent" value={filters.minRent} onChange={handleFilterChange} className={`${inputClass} w-28`} />
        <input name="maxRent" type="number" placeholder="Max rent" value={filters.maxRent} onChange={handleFilterChange} className={`${inputClass} w-28`} />
        <input name="bedrooms" type="number" placeholder="Bedrooms" value={filters.bedrooms} onChange={handleFilterChange} className={`${inputClass} w-28`} />
        <button type="submit" className="bg-black dark:bg-white text-white dark:text-black rounded-lg px-4 py-2 font-semibold">Search</button>
      </form>

      {loading && <p>Loading listings...</p>}
      {error && <p className="text-red-600 dark:text-red-400">{error}</p>}
      {!loading && !error && listings.length === 0 && <p className="text-gray-600 dark:text-gray-400">No listings match your search.</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {listings.map((listing) => <ListingCard key={listing._id} listing={listing} />)}
      </div>
    </div>
  );
}
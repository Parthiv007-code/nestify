import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    state: '', district: '', city: '', pincode: '', minRent: '', maxRent: '', bedrooms: '',
  });

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

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
    fetchListings(filters);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchListings(filters);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Search Listings</h1>

      <form onSubmit={handleSearch} className="flex flex-wrap gap-3 mb-8">
        <input name="state" type="text" placeholder="State" value={filters.state} onChange={handleFilterChange} required className="border rounded-lg p-2" />
        <input name="district" type="text" placeholder="District" value={filters.district} onChange={handleFilterChange} required className="border rounded-lg p-2" />
        <input name="city" type="text" placeholder="City / Town / Village" value={filters.city} onChange={handleFilterChange} className="border rounded-lg p-2" />
        <input name="pincode" type="text" placeholder="Pincode" value={filters.pincode} onChange={handleFilterChange} className="border rounded-lg p-2 w-28" />
        <input name="minRent" type="number" placeholder="Min rent" value={filters.minRent} onChange={handleFilterChange} className="border rounded-lg p-2 w-28" />
        <input name="maxRent" type="number" placeholder="Max rent" value={filters.maxRent} onChange={handleFilterChange} className="border rounded-lg p-2 w-28" />
        <input name="bedrooms" type="number" placeholder="Bedrooms" value={filters.bedrooms} onChange={handleFilterChange} className="border rounded-lg p-2 w-28" />
        <button type="submit" className="bg-black text-white rounded-lg px-4 py-2 font-semibold">Search</button>
      </form>

      {loading && <p>Loading listings...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && listings.length === 0 && <p className="text-gray-600">No listings match your search.</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <Link key={listing.id} to={`/listings/${listing.id}`} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
            <img src={listing.imageUrl} alt={listing.title} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h2 className="font-semibold text-lg">{listing.title}</h2>
              <p className="text-gray-600">{listing.city}, {listing.district}, {listing.state} — {listing.pincode}</p>
              <p className="mt-2 font-bold">₹{listing.rent}/month</p>
              <p className="text-sm text-gray-500">{listing.bedrooms} bed · {listing.bathrooms} bath</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
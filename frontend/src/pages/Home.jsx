import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

function ListingCard({ listing }) {
  return (
    <Link to={`/listings/${listing.id}`} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
      <img src={listing.imageUrl} alt={listing.title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="font-semibold text-lg">{listing.title}</h3>
        <p className="text-gray-600">{listing.city}, {listing.district}, {listing.state} — {listing.pincode}</p>
        <p className="mt-2 font-bold">₹{listing.rent}/month</p>
        <p className="text-sm text-gray-500">{listing.bedrooms} bed · {listing.bathrooms} bath</p>
      </div>
    </Link>
  );
}

export default function Home() {
  const [user, setUser] = useState(null);
  const [mainListings, setMainListings] = useState([]);
  const [mainTitle, setMainTitle] = useState('Available Listings');
  const [mainLoading, setMainLoading] = useState(true);

  const [ownerListings, setOwnerListings] = useState([]);
  const [rentedListings, setRentedListings] = useState([]);

  const [searchOpen, setSearchOpen] = useState(false);
  const [filters, setFilters] = useState({
    state: '', district: '', city: '', pincode: '', minRent: '', maxRent: '', bedrooms: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      fetchMainListings({});
      setMainLoading(false);
      return;
    }

    api.get('/users/me')
      .then((response) => {
        const me = response.data;
        setUser(me);

        if (me.city) {
          setMainTitle('Near You');
          fetchMainListings({ city: me.city });
        } else {
          fetchMainListings({});
        }

        if (me.role === 'OWNER') {
          api.get('/listings/mine/all').then((res) => setOwnerListings(res.data)).catch(console.error);
        }
        if (me.role === 'RENTER') {
          api.get('/listings/rented-by-me').then((res) => setRentedListings(res.data)).catch(console.error);
        }
      })
      .catch((err) => {
        console.error(err);
        fetchMainListings({});
      });
  }, []);

  const fetchMainListings = (activeFilters) => {
    setMainLoading(true);
    const params = new URLSearchParams();
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    api.get(`/listings?${params.toString()}`)
      .then((response) => {
        setMainListings(response.data);
        setMainLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setMainLoading(false);
      });
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setMainTitle('Search Results');
    fetchMainListings(filters);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{mainTitle}</h1>
        <button onClick={() => setSearchOpen(!searchOpen)} className="border rounded-lg px-4 py-2 font-semibold">
          {searchOpen ? 'Close search' : 'Search'}
        </button>
      </div>

      {searchOpen && (
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 mb-6">
          <input name="state" type="text" placeholder="State" value={filters.state} onChange={handleFilterChange} required className="border rounded-lg p-2" />
<input name="district" type="text" placeholder="District" value={filters.district} onChange={handleFilterChange} required className="border rounded-lg p-2" />
          <input name="city" type="text" placeholder="City / Town / Village" value={filters.city} onChange={handleFilterChange} className="border rounded-lg p-2" />
          <input name="pincode" type="text" placeholder="Pincode" value={filters.pincode} onChange={handleFilterChange} className="border rounded-lg p-2 w-28" />
          <input name="minRent" type="number" placeholder="Min rent" value={filters.minRent} onChange={handleFilterChange} className="border rounded-lg p-2 w-28" />
          <input name="maxRent" type="number" placeholder="Max rent" value={filters.maxRent} onChange={handleFilterChange} className="border rounded-lg p-2 w-28" />
          <input name="bedrooms" type="number" placeholder="Bedrooms" value={filters.bedrooms} onChange={handleFilterChange} className="border rounded-lg p-2 w-28" />
          <button type="submit" className="bg-black text-white rounded-lg px-4 py-2 font-semibold">Search</button>
        </form>
      )}

      {mainLoading ? (
        <p>Loading...</p>
      ) : mainListings.length === 0 ? (
        <p className="text-gray-600">No listings found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {mainListings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
        </div>
      )}

      {user?.role === 'OWNER' && (
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-4">Your Listings</h2>
          {ownerListings.length === 0 ? (
            <p className="text-gray-600">You haven't posted any listings yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ownerListings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
            </div>
          )}
        </div>
      )}

      {user?.role === 'RENTER' && (
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-4">Your Rentals</h2>
          {rentedListings.length === 0 ? (
            <p className="text-gray-600">You don't have any active rentals.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {rentedListings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
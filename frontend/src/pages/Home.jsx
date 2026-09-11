import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import AddListingForm from '../components/AddListingForm';

function ListingCard({ listing }) {
  const firstImage = listing.images?.[0]?.url || listing.imageUrl;
  const imageSrc = firstImage?.startsWith('/uploads')
    ? `http://localhost:4000${firstImage}`
    : firstImage;

  return (
    <Link to={`/listings/${listing.id}`} className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:border-accent transition-colors">
      <div className="relative">
        <img src={imageSrc} alt={listing.title} className="w-full h-48 object-cover" />
        <span className="absolute top-2 left-2 bg-white/90 dark:bg-black/70 text-xs font-semibold px-2 py-1 rounded-md">
          {listing.type === 'PG' ? 'PG' : 'For Rent'}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-heading font-bold text-base">{listing.title}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{listing.city}, {listing.district}, {listing.state} — {listing.pincode}</p>
        <p className="mt-2 font-bold text-accent">₹{listing.rent}/month</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{listing.bedrooms} bed · {listing.bathrooms} bath</p>
      </div>
    </Link>
  );
}

export default function Home() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('all');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const [cityListings, setCityListings] = useState([]);
  const [districtListings, setDistrictListings] = useState([]);
  const [searchListings, setSearchListings] = useState([]);
  const [mainLoading, setMainLoading] = useState(true);

  const [ownerListings, setOwnerListings] = useState([]);
  const [rentedListings, setRentedListings] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);
  const [filters, setFilters] = useState({
    state: '', district: '', city: '', pincode: '', minRent: '', maxRent: '', bedrooms: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMode('all');
      fetchAllListings('ALL');
      return;
    }

    api.get('/users/me')
      .then((response) => {
        const me = response.data;
        setUser(me);

        if (me.city && me.district) {
          setMode('near');
          fetchNearYou(me, 'ALL');
        } else {
          setMode('all');
          fetchAllListings('ALL');
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
        setMode('all');
        fetchAllListings('ALL');
      });
  }, []);

  const buildParams = (activeFilters) => {
    const params = new URLSearchParams();
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    return params.toString();
  };

  const fetchNearYou = async (me, type) => {
    setMainLoading(true);
    try {
      const typeParam = type === 'ALL' ? '' : type;

      const cityRes = await api.get(`/listings?${buildParams({ city: me.city, type: typeParam })}`);
      const districtRes = await api.get(`/listings?${buildParams({ district: me.district, type: typeParam })}`);

      const cityResults = cityRes.data;
      const cityIds = new Set(cityResults.map((l) => l.id));
      const restOfDistrict = districtRes.data.filter((l) => !cityIds.has(l.id));

      setCityListings(cityResults);
      setDistrictListings(restOfDistrict);
    } catch (err) {
      console.error(err);
    } finally {
      setMainLoading(false);
    }
  };

  const fetchAllListings = (type) => {
    setMainLoading(true);
    const typeParam = type === 'ALL' ? '' : type;
    api.get(`/listings?${buildParams({ type: typeParam })}`)
      .then((response) => {
        setSearchListings(response.data);
        setMainLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setMainLoading(false);
      });
  };

  const fetchSearch = (activeFilters, type) => {
    setMainLoading(true);
    const typeParam = type === 'ALL' ? '' : type;
    api.get(`/listings?${buildParams({ ...activeFilters, type: typeParam })}`)
      .then((response) => {
        setSearchListings(response.data);
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
    setMode('search');
    fetchSearch(filters, typeFilter);
  };

  const handleTypeFilterChange = (t) => {
    setTypeFilter(t);
    if (mode === 'near' && user) {
      fetchNearYou(user, t);
    } else if (mode === 'search') {
      fetchSearch(filters, t);
    } else {
      fetchAllListings(t);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-heading text-2xl font-extrabold">
          {mode === 'near' ? 'Near You' : mode === 'search' ? 'Search Results' : 'Available Listings'}
        </h1>
        <button onClick={() => setSearchOpen(!searchOpen)} className="border border-gray-200 dark:border-gray-700 rounded-md px-4 py-2 text-sm font-semibold hover:border-accent transition-colors">
          {searchOpen ? 'Close search' : 'Search'}
        </button>
      </div>

      {searchOpen && (
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 mb-6">
          <input name="state" type="text" placeholder="State" value={filters.state} onChange={handleFilterChange} required className="border border-gray-200 dark:border-gray-700 dark:bg-[#15171A] rounded-md p-2 text-sm" />
          <input name="district" type="text" placeholder="District" value={filters.district} onChange={handleFilterChange} required className="border border-gray-200 dark:border-gray-700 dark:bg-[#15171A] rounded-md p-2 text-sm" />
          <input name="city" type="text" placeholder="City / Town / Village" value={filters.city} onChange={handleFilterChange} className="border border-gray-200 dark:border-gray-700 dark:bg-[#15171A] rounded-md p-2 text-sm" />
          <input name="pincode" type="text" placeholder="Pincode" value={filters.pincode} onChange={handleFilterChange} className="border border-gray-200 dark:border-gray-700 dark:bg-[#15171A] rounded-md p-2 text-sm w-28" />
          <input name="minRent" type="number" placeholder="Min rent" value={filters.minRent} onChange={handleFilterChange} className="border border-gray-200 dark:border-gray-700 dark:bg-[#15171A] rounded-md p-2 text-sm w-28" />
          <input name="maxRent" type="number" placeholder="Max rent" value={filters.maxRent} onChange={handleFilterChange} className="border border-gray-200 dark:border-gray-700 dark:bg-[#15171A] rounded-md p-2 text-sm w-28" />
          <input name="bedrooms" type="number" placeholder="Bedrooms" value={filters.bedrooms} onChange={handleFilterChange} className="border border-gray-200 dark:border-gray-700 dark:bg-[#15171A] rounded-md p-2 text-sm w-28" />
          <button type="submit" className="bg-accent text-white rounded-md px-4 py-2 text-sm font-semibold hover:bg-accent-dark transition-colors">Search</button>
        </form>
      )}

      <div className="flex gap-2 mb-4">
        {['ALL', 'RENT', 'PG'].map((t) => (
          <button
            key={t}
            onClick={() => handleTypeFilterChange(t)}
            className={`px-4 py-2 rounded-md text-sm font-semibold border transition-colors ${
              typeFilter === t
                ? 'bg-accent text-white border-accent'
                : 'border-gray-200 dark:border-gray-700 hover:border-accent'
            }`}
          >
            {t === 'ALL' ? 'All' : t === 'RENT' ? 'For Rent' : 'PG'}
          </button>
        ))}
      </div>

      {mainLoading ? (
        <p>Loading...</p>
      ) : mode === 'near' ? (
        cityListings.length === 0 && districtListings.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 mb-12">No listings found near you yet.</p>
        ) : (
          <>
            {cityListings.length > 0 && (
              <div className="mb-10">
                <h2 className="font-heading text-lg font-bold mb-3">Top picks in {user.city}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {cityListings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
                </div>
              </div>
            )}
            {districtListings.length > 0 && (
              <div className="mb-12">
                <h2 className="font-heading text-lg font-bold mb-3">More across {user.district}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {districtListings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
                </div>
              </div>
            )}
          </>
        )
      ) : searchListings.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 mb-12">No listings found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {searchListings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
        </div>
      )}

      {user?.role === 'OWNER' && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-bold">Your Listings</h2>
            <button onClick={() => setShowAddForm(!showAddForm)}
              className="border border-gray-200 dark:border-gray-700 rounded-md px-4 py-2 text-sm font-semibold hover:border-accent transition-colors">
              {showAddForm ? 'Cancel' : '+ Add listing'}
            </button>
          </div>

          {showAddForm && (
            <AddListingForm
              onListingCreated={(newListing) => {
                setOwnerListings([newListing, ...ownerListings]);
                setShowAddForm(false);
              }}
              onCancel={() => setShowAddForm(false)}
            />
          )}

          {ownerListings.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">You haven't posted any listings yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ownerListings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
            </div>
          )}
        </div>
      )}

      {user?.role === 'RENTER' && (
        <div className="mb-12">
          <h2 className="font-heading text-xl font-bold mb-4">Your Rentals</h2>
          {rentedListings.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">You don't have any active rentals.</p>
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
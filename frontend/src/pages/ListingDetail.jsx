import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';

export default function ListingDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then((response) => {
        setListing(response.data);
        setActiveImage(0);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Listing not found');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p className="p-8">Loading...</p>;
  if (error) return <p className="p-8 text-red-600">{error}</p>;

  const photos = listing.images?.length > 0
    ? listing.images.map((img) => img.url)
    : listing.imageUrl ? [listing.imageUrl] : [];

  const fullUrl = (url) => url?.startsWith('/uploads') ? `http://localhost:4000${url}` : url;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link to="/listings" className="text-accent hover:underline text-sm">&larr; Back to listings</Link>

      {photos.length > 0 && (
        <>
          <img src={fullUrl(photos[activeImage])} alt={listing.title} className="w-full h-80 object-cover rounded-lg mt-4" />
          {photos.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {photos.map((url, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border-2 transition-colors ${
                    activeImage === index ? 'border-accent' : 'border-transparent'
                  }`}
                >
                  <img src={fullUrl(url)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <h1 className="font-heading text-3xl font-extrabold mt-6">{listing.title}</h1>
      <p className="text-gray-500 dark:text-gray-400 text-lg">{listing.city}, {listing.district}, {listing.state} — {listing.pincode}</p>
      <p className="text-2xl font-bold text-accent mt-2">₹{listing.rent}/month</p>
      <p className="mt-1 text-gray-600 dark:text-gray-400">{listing.bedrooms} bed · {listing.bathrooms} bath</p>

      <p className="mt-6 text-gray-800 dark:text-gray-200">{listing.description}</p>

      <div className="mt-6 p-4 bg-gray-50 dark:bg-[#15171A] rounded-lg">
        <p className="font-semibold">Contact owner</p>
        <p className="text-gray-700 dark:text-gray-300">
          {listing.owner ? `${listing.owner.name} — ${listing.owner.email}` : 'Contact info unavailable'}
        </p>
      </div>
    </div>
  );
}
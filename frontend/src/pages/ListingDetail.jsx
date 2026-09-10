import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';

export default function ListingDetail() {
  const { id } = useParams(); // reads the ":id" part of the current URL
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then((response) => {
        setListing(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Listing not found');
        setLoading(false);
      });
  }, [id]); // re-run this effect if the id in the URL ever changes

  if (loading) return <p className="p-8">Loading...</p>;
  if (error) return <p className="p-8 text-red-600">{error}</p>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link to="/listings" className="text-blue-600 hover:underline">&larr; Back to listings</Link>

      <img src={listing.imageUrl} alt={listing.title} className="w-full h-80 object-cover rounded-lg mt-4" />

      <h1 className="text-3xl font-bold mt-6">{listing.title}</h1>
      <p className="text-gray-600 text-lg">{listing.city}, {listing.district}, {listing.state} — {listing.pincode}</p>
      <p className="text-2xl font-bold mt-2">₹{listing.rent}/month</p>
      <p className="mt-1 text-gray-700">{listing.bedrooms} bed · {listing.bathrooms} bath</p>

      <p className="mt-6 text-gray-800">{listing.description}</p>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="font-semibold">Contact owner</p>
        <p className="text-gray-700">{listing.owner.name} — {listing.owner.email}</p>
      </div>
    </div>
  );
}
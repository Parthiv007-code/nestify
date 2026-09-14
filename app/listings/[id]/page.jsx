'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/apiClient';

export default function ListingDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewIndex, setPreviewIndex] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then((response) => {
        setListing(response.data);
        setLoading(false);

        api.get('/users/me')
          .then((me) => setIsOwner(me.data._id === response.data.owner?._id))
          .catch(() => setIsOwner(false));
      })
      .catch((err) => {
        console.error(err);
        setError('Listing not found');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p className="p-8">Loading...</p>;
  if (error) return <p className="p-8 text-red-600 dark:text-red-400">{error}</p>;

  const images = listing.images || [];

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <Link href="/listings" className="text-blue-600 dark:text-blue-400 hover:underline">&larr; Back to listings</Link>
        {isOwner && (
          <Link href={`/listings/${id}/edit`} className="text-sm font-semibold border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 hover:border-gray-500 dark:hover:border-gray-400">
            Edit listing
          </Link>
        )}
      </div>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-4">
          {images.map((src, index) => (
            <img
              key={index}
              src={src}
              alt={listing.title}
              onClick={() => setPreviewIndex(index)}
              className={`object-cover rounded-lg cursor-pointer ${index === 0 ? 'w-full h-80' : 'w-24 h-24'}`}
            />
          ))}
        </div>
      )}

      <h1 className="text-3xl font-bold mt-6">{listing.title}</h1>
      <p className="text-gray-600 dark:text-gray-400 text-lg">{listing.city}, {listing.district}, {listing.state} — {listing.pincode}</p>
      <p className="text-2xl font-bold mt-2">₹{listing.rent}/month</p>
      <p className="mt-1 text-gray-700 dark:text-gray-300">{listing.bedrooms} bed · {listing.bathrooms} bath</p>

      <p className="mt-6 text-gray-800 dark:text-gray-200">{listing.description}</p>

      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <p className="font-semibold">Contact owner</p>
        <p className="text-gray-700 dark:text-gray-300">{listing.owner?.name} — {listing.owner?.email}</p>
      </div>

      {previewIndex !== null && images[previewIndex] && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6"
          onClick={() => setPreviewIndex(null)}
        >
          <img
            src={images[previewIndex]}
            alt=""
            className="max-w-full max-h-full rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setPreviewIndex(null)}
            className="absolute top-6 right-6 text-white text-2xl w-10 h-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
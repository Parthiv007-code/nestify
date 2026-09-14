// Dynamic route: the [id] folder name makes this file handle
// GET/PUT/DELETE /api/listings/<anything>, with that value available
// as params.id below — same concept as Express's :id or React Router's :id.

import connectDB from '@/lib/mongodb';
import Listing from '@/models/Listing';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params; // Next.js requires awaiting params in recent versions

    const listing = await Listing.findById(id).populate('owner', 'name email');
    if (!listing) return Response.json({ error: 'Listing not found' }, { status: 404 });

    return Response.json(listing);
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to fetch listing' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const auth = getUserFromRequest(request);
  if (!auth) return Response.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    await connectDB();
    const { id } = await params;

    const listing = await Listing.findById(id);
    if (!listing) return Response.json({ error: 'Listing not found' }, { status: 404 });
    if (listing.owner.toString() !== auth.userId) {
      return Response.json({ error: "You don't own this listing" }, { status: 403 });
    }

    const body = await request.json();
    const allowedFields = ['title', 'description', 'rent', 'state', 'district', 'city', 'pincode', 'bedrooms', 'bathrooms', 'images'];
    allowedFields.forEach((field) => {
      if (body[field] !== undefined) listing[field] = body[field];
    });

    await listing.save();
    return Response.json(listing);
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to update listing' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = getUserFromRequest(request);
  if (!auth) return Response.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    await connectDB();
    const { id } = await params;

    const listing = await Listing.findById(id);
    if (!listing) return Response.json({ error: 'Listing not found' }, { status: 404 });
    if (listing.owner.toString() !== auth.userId) {
      return Response.json({ error: "You don't own this listing" }, { status: 403 });
    }

    await listing.deleteOne();
    return new Response(null, { status: 204 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to delete listing' }, { status: 500 });
  }
}

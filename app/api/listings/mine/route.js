import connectDB from '@/lib/mongodb';
import Listing from '@/models/Listing';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/listings/mine — the logged-in owner's own listings, for a dashboard
export async function GET(request) {
  const auth = getUserFromRequest(request);
  if (!auth) return Response.json({ error: 'Not authenticated' }, { status: 401 });
  if (auth.role !== 'OWNER') return Response.json({ error: 'Only owners can do this' }, { status: 403 });

  try {
    await connectDB();
    const listings = await Listing.find({ owner: auth.userId }).sort({ createdAt: -1 });
    return Response.json(listings);
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to fetch your listings' }, { status: 500 });
  }
}

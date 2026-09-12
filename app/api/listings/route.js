import connectDB from '@/lib/mongodb';
import Listing from '@/models/Listing';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/listings?state=&district=&city=&pincode=&minRent=&maxRent=&bedrooms=
export async function GET(request) {
  try {
    await connectDB();

    // request.url is the full URL; searchParams parses the "?key=value" part —
    // same job as Express's req.query, different API to get there.
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');
    const district = searchParams.get('district');
    const city = searchParams.get('city');
    const pincode = searchParams.get('pincode');
    const minRent = searchParams.get('minRent');
    const maxRent = searchParams.get('maxRent');
    const bedrooms = searchParams.get('bedrooms');

    // MongoDB filter object — conceptually the same idea as Prisma's `where`,
    // but Mongo's own query syntax. $regex + 'i' option = case-insensitive
    // partial match, equivalent to Prisma's `contains`.
    const filter = {};
    if (state) filter.state = { $regex: state, $options: 'i' };
    if (district) filter.district = { $regex: district, $options: 'i' };
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (pincode) filter.pincode = { $regex: pincode, $options: 'i' };
    if (bedrooms) filter.bedrooms = Number(bedrooms);
    if (minRent || maxRent) {
      filter.rent = {};
      if (minRent) filter.rent.$gte = Number(minRent);
      if (maxRent) filter.rent.$lte = Number(maxRent);
    }

    // .populate('owner', 'name email') is Mongoose's equivalent of Prisma's
    // `include` — it follows the ObjectId reference and pulls in the actual
    // owner document (just the name/email fields) instead of leaving a bare ID.
    const listings = await Listing.find(filter)
      .sort({ createdAt: -1 })
      .populate('owner', 'name email');

    return Response.json(listings);
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}

// POST /api/listings — create a listing. Must be logged in as an OWNER.
export async function POST(request) {
  const auth = getUserFromRequest(request);
  if (!auth) return Response.json({ error: 'Not authenticated' }, { status: 401 });
  if (auth.role !== 'OWNER') return Response.json({ error: 'Only owners can do this' }, { status: 403 });

  try {
    await connectDB();
    const { title, description, rent, state, district, city, pincode, bedrooms, bathrooms, imageUrl } = await request.json();

    if (!title || !description || !rent || !state || !district || !city || !pincode || !bedrooms || !bathrooms) {
      return Response.json({ error: 'Missing required listing fields' }, { status: 400 });
    }

    const listing = await Listing.create({
      title, description, rent: Number(rent),
      state, district, city, pincode,
      bedrooms: Number(bedrooms), bathrooms: Number(bathrooms),
      imageUrl: imageUrl || null,
      owner: auth.userId,
    });

    return Response.json(listing, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to create listing' }, { status: 500 });
  }
}

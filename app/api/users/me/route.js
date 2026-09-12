import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/users/me — return the logged-in user's own profile
export async function GET(request) {
  const auth = getUserFromRequest(request);
  if (!auth) return Response.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    await connectDB();
    const user = await User.findById(auth.userId).select('-password'); // exclude password hash from result
    if (!user) return Response.json({ error: 'User not found' }, { status: 404 });

    return Response.json(user);
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// PATCH /api/users/me — update the logged-in user's own profile
export async function PATCH(request) {
  const auth = getUserFromRequest(request);
  if (!auth) return Response.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    await connectDB();
    const { name, state, district, city, pincode } = await request.json();

    const updated = await User.findByIdAndUpdate(
      auth.userId,
      { name, state, district, city, pincode },
      { new: true } // return the document AFTER updating, not before
    ).select('-password');

    if (!updated) return Response.json({ error: 'User not found' }, { status: 404 });

    return Response.json(updated);
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

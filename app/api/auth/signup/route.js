// Next.js API route convention: exporting a function named after the HTTP
// method (POST, GET, etc.) is how you handle that verb — no router.post(...)
// call needed, the file path itself IS the route.
// This file lives at app/api/auth/signup/route.js, so it becomes:
//   POST /api/auth/signup

import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();

    const { email, password, name, role, state, district, city, pincode } = await request.json();

    if (!email || !password || !name || !role) {
      return Response.json({ error: 'email, password, name, and role are all required' }, { status: 400 });
    }
    if (role !== 'OWNER' && role !== 'RENTER') {
      return Response.json({ error: 'role must be OWNER or RENTER' }, { status: 400 });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return Response.json({ error: 'An account with that email already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email, password: hashedPassword, name, role,
      state: state || '', district: district || '', city: city || '', pincode: pincode || '',
    });

    // user._id is MongoDB's own ID field (an ObjectId) — the equivalent of
    // Prisma's auto-incrementing integer `id`, just a different format (a string
    // like "656f1a2b3c4d5e6f7a8b9c0d" instead of a plain number).
    const token = signToken({ userId: user._id.toString(), role: user.role });

    return Response.json({
      token,
      user: {
        id: user._id, email: user.email, name: user.name, role: user.role,
        state: user.state, district: user.district, city: user.city, pincode: user.pincode,
      },
    }, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Something went wrong during signup' }, { status: 500 });
  }
}

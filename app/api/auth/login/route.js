import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();

    const { email, password } = await request.json();
    if (!email || !password) {
      return Response.json({ error: 'email and password are required' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = signToken({ userId: user._id.toString(), role: user.role });

    return Response.json({
      token,
      user: {
        id: user._id, email: user.email, name: user.name, role: user.role,
        state: user.state, district: user.district, city: user.city, pincode: user.pincode,
      },
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Something went wrong during login' }, { status: 500 });
  }
}

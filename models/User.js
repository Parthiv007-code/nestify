// Mongoose "schema" — same job as Prisma's schema.prisma model block,
// but written as plain JS instead of Prisma's special syntax, and describing
// a MongoDB *document* shape rather than a SQL table's columns.
//
// Key mental shift from SQL: MongoDB has no foreign keys or migrations.
// A document can be missing a field entirely (no "column" exists globally),
// and relationships (like a listing's owner) are just an ID stored as a
// plain field, resolved manually in your queries — there's no automatic
// JOIN like Prisma's `include` was doing for us.

import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // bcrypt hash, same as before
  name: { type: String, required: true },
  role: { type: String, enum: ['OWNER', 'RENTER'], required: true },
  state: { type: String, default: '' },
  district: { type: String, default: '' },
  city: { type: String, default: '' },
  pincode: { type: String, default: '' },
}, {
  timestamps: true, // automatically adds createdAt / updatedAt fields
});

// This "if it already exists, reuse it" check exists for the same hot-reload
// reason as the connection cache above — without it, Next.js dev mode would
// try to redefine the model on every file save and Mongoose would throw.
export default mongoose.models.User || mongoose.model('User', UserSchema);

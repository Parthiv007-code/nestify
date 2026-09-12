// Mongoose connection helper.
//
// Why this is more involved than a normal "connect once" call:
// In Next.js development, your API route files get hot-reloaded constantly.
// Without caching, every single file change would open a brand new database
// connection, and you'd quickly exhaust MongoDB's connection limit.
// So we cache the connection (and the in-progress connection promise) on
// the Node global object, which survives hot-reloads within the same process.

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn; // already connected, reuse it
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;

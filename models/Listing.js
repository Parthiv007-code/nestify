import mongoose from 'mongoose';

const ListingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  rent: { type: Number, required: true },
  state: { type: String, required: true },
  district: { type: String, required: true },
  city: { type: String, required: true },
  pincode: { type: String, required: true },
  bedrooms: { type: Number, required: true },
  bathrooms: { type: Number, required: true },

  // Array of base64 data-URI strings, stored directly in MongoDB rather than
  // as files on disk — Vercel's serverless functions have a read-only,
  // ephemeral filesystem, so anything written there disappears between
  // requests. This sidesteps needing a separate file-storage service.
  images: { type: [String], default: [] },

  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true,
});

export default mongoose.models.Listing || mongoose.model('Listing', ListingSchema);
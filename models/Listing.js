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
  imageUrl: { type: String, default: null },

  // No foreign key constraint here (MongoDB doesn't enforce this the way
  // SQL does) — just an ObjectId reference. `ref: 'User'` tells Mongoose
  // which model to look in if we ask it to "populate" this field later.
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true,
});

export default mongoose.models.Listing || mongoose.model('Listing', ListingSchema);

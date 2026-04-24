const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['Furniture', 'Electronics', 'Vehicles', 'Garments', 'Tools', 'Sports', 'Books', 'Others'],
    },
    pricePerDay: { type: Number, required: true, min: 0 },
    pricePerWeek: { type: Number, default: 0 },
    images: [{ type: String }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    city: { type: String, default: '' },
    isAvailable: { type: Boolean, default: true },
    condition: { type: String, enum: ['New', 'Like New', 'Good', 'Fair'], default: 'Good' },
    features: [{ type: String }],
    averageRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    totalRentals: { type: Number, default: 0 },
    bookedDates: [
      {
        startDate: Date,
        endDate: Date,
      },
    ],
  },
  { timestamps: true }
);

// Text search index
productSchema.index({ title: 'text', description: 'text', city: 'text' });

module.exports = mongoose.model('Product', productSchema);

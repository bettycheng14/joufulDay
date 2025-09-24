const mongoose = require("mongoose");

const tourSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: String,

  latitude: Number,
  longitude: Number,

  averageVisitDuration: Number,
  imageUrl: String,
  rating: Number,
  reviewsCount: Number,
  price: Number,

  tags: [String]
}, { timestamps: true });


module.exports = mongoose.model("Tour", tourSchema);

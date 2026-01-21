import mongoose from "mongoose";

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    default: "",
  },

  price: {
    type: Number,
    required: true,
  },

  coverImage: {
    type: String, // URL gambar (Cloudinary / optional)
    default: "",
  },

  driveLink: {
    type: String, // Link Google Drive PDF
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Book ||
  mongoose.model("Book", BookSchema);

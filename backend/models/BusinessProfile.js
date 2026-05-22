import mongoose from 'mongoose';

const businessProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    workingHours: {
      type: String,
      default: null,
    },
    slogan: {
      type: String,
      default: null,
    },
    projectsServices: {
      type: String,
      required: [true, 'Projects or services are required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
    },
    website: {
      type: String,
      default: null,
    },
    socialLinks: {
      linkedin: { type: String, default: null },
      facebook: { type: String, default: null },
      twitter: { type: String, default: null },
      instagram: { type: String, default: null },
      github: { type: String, default: null },
      whatsapp: { type: String, default: null },
    },
  },
  { timestamps: true }
);

export default mongoose.model('BusinessProfile', businessProfileSchema);
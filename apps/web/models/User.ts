import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    // ==========================
    // Basic Information
    // ==========================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
    },

    // ==========================
    // Role & Permissions
    // ==========================

    role: {
      type: String,
      enum: ["student", "mentor", "admin"],
      default: "student",
      required: true,
    },

    // ==========================
    // Gamification
    // ==========================

    xp: {
      type: Number,
      default: 0,
      min: 0,
    },

    level: {
      type: Number,
      default: 1,
      min: 1,
    },

    coins: {
      type: Number,
      default: 100,
      min: 0,
    },

    streak: {
      type: Number,
      default: 0,
      min: 0,
    },

    badges: [
      {
        type: String,
      },
    ],

    // ==========================
    // Progress
    // ==========================

    completedCourses: [
      {
        type: String,
      },
    ],

    completedLabs: [
      {
        type: String,
      },
    ],

    rewardedLabs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Lab",
      },
    ],

    completedGames: [
      {
        type: String,
      },
    ],

    // ==========================
    // Social Links
    // ==========================

    github: {
      type: String,
      default: "",
      trim: true,
    },

    linkedin: {
      type: String,
      default: "",
      trim: true,
    },

    website: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================
    // Account Status
    // ==========================

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = models.User || model("User", UserSchema);

export default User;
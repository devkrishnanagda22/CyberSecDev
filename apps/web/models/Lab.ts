import { Schema, model, models } from "mongoose";

const LabSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },

    estimatedHours: {
      type: Number,
      default: 1,
    },

    instructions: {
      type: String,
      default: "",
    },

    hints: {
      type: [String],
      default: [],
    },

    category: {
      type: String,
      default: "General",
    },

    xpReward: {
      type: Number,
      default: 200,
    },

    coinsReward: {
      type: Number,
      default: 25,
    },

    badge: {
      type: String,
      default: "",
    },

    flag: {
      type: String,
      trim: true,
      select: false,
    },

    flagHash: {
      type: String,
      select: false,
    },

    tags: {
      type: [String],
      default: [],
    },

    published: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  }
);

const Lab = models.Lab || model("Lab", LabSchema);

export default Lab;
import mongoose, { Schema, model, models } from "mongoose";

const CourseSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },

    thumbnail: {
      type: String,
      default: "",
    },

    xpReward: {
      type: Number,
      default: 100,
    },

    estimatedHours: {
      type: Number,
      default: 2,
    },

    published: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  }
);

const Course =
  models.Course || model("Course", CourseSchema);

export default Course;
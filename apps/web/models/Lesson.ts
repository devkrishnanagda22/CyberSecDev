import mongoose, { Schema, model, models } from "mongoose";

const LessonSchema = new Schema(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

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

    content: {
      type: String,
      required: true,
    },

    order: {
      type: Number,
      default: 1,
    },

    videoUrl: {
      type: String,
      default: "",
    },

    duration: {
      type: Number,
      default: 10,
    },

    xpReward: {
      type: Number,
      default: 50,
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

const Lesson =
  models.Lesson || model("Lesson", LessonSchema);

export default Lesson;
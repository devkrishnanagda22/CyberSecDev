import { Schema, model, models } from "mongoose";

const ProgressSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
    },

    completedLessons: {
      type: [String],
      default: [],
    },

    progress: {
      type: Number,
      default: 0,
    },

    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

ProgressSchema.index(
  {
    userId: 1,
    courseId: 1,
  },
  {
    unique: true,
  }
);

const Progress =
  models.Progress || model("Progress", ProgressSchema);

export default Progress;
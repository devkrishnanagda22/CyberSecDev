import { Schema, model, models } from "mongoose";

const LabProgressSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    labId: {
      type: Schema.Types.ObjectId,
      ref: "Lab",
      required: true,
    },

    started: {
      type: Boolean,
      default: false,
    },

    completed: {
      type: Boolean,
      default: false,
    },

    progress: {
      type: Number,
      default: 0,
    },

    startedAt: Date,

    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

LabProgressSchema.index(
  {
    userId: 1,
    labId: 1,
  },
  {
    unique: true,
  }
);

export default models.LabProgress ||
  model("LabProgress", LabProgressSchema);
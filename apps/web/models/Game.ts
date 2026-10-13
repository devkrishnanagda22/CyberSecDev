import { Schema, model, models } from "mongoose";

const GameSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
    category: { type: String, default: "Miscellaneous" },
    difficulty: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
    estimatedHours: { type: Number, default: 1 },
    thumbnail: { type: String, default: "" },
    instructions: { type: String, default: "" },
    objectives: { type: [String], default: [] },
    hints: { type: [String], default: [] },
    solution: { type: String, default: "" },
    timerEnabled: { type: Boolean, default: false },
    timerSeconds: { type: Number, default: 300 },
    xpReward: { type: Number, default: 250 },
    coinsReward: { type: Number, default: 50 },
    badge: { type: String, default: "" },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Game = models.Game || model("Game", GameSchema);

export default Game;

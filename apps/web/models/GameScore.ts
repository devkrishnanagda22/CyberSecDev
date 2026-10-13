import { Schema, model, models } from "mongoose";

const GameScoreSchema = new Schema(
  {
    gameId: { type: Schema.Types.ObjectId, ref: "Game", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    score: { type: Number, required: true, default: 0 },
    attempts: { type: Number, default: 1 },
    completed: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

GameScoreSchema.index({ gameId: 1, userId: 1 }, { unique: true });

const GameScore = models.GameScore || model("GameScore", GameScoreSchema);

export default GameScore;

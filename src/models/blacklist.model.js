import mongoose from "mongoose";

const blacklistSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: [true, "token must required"],
    },
  },
  { timestamps: true },
);

blacklistSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 3 * 24 * 60 * 60 },
); // 3d day expiration;

const blacklistModel = mongoose.model("blacklist", blacklistSchema);

export default blacklistModel;

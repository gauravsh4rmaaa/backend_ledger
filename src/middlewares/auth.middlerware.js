import jwt from "jsonwebtoken";
import config from "../config/config.js";
import userModel from "../models/user.model.js";
import blacklistModel from "../models/blacklist.model.js";

export const authmiddlware = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({
      message: "Token not found",
    });
  }

  const blacklistedToken = await blacklistModel.findOne({ token });
  if (blacklistedToken) {
    return res.status(400).json({
      message: "Token expired",
    });
  }
  try {
    const decoded = jwt.verify(token, config.jwtSKey);

    const user = await userModel.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

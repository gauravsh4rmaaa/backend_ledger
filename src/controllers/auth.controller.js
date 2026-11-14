import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import config from "../config/config.js";
import { sendRegistrationEmail } from "../services/email.service.js";
import blacklistModel from "../models/blacklist.model.js";

export const register = async (req, res) => {
  if (
    !req.body ||
    !req.body.username ||
    !req.body.email ||
    !req.body.password
  ) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields" });
  }

  try {
    const { username, email, password, systemUser } = req.body;

    const isExistinguser = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (isExistinguser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await userModel.create({
      username,
      email,
      password,
      systemUser,
    });

    // creating token
    const token = jwt.sign({ userId: user._id }, config.jwtSKey, {
      expiresIn: "7d",
    });

    res.cookie("token", token);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        username,
        email,
      },
      token,
    });

    await sendRegistrationEmail(user.email, user.username);
  } catch (error) {
    // Mongoose validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        errors: Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const login = async (req, res) => {
  if (!req.body || !req.body.email || !req.body.password) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields" });
  }

  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "User Not Found",
      });
    }

    // checking password
    const isvalidpassword = await user.comparePassword(password);

    if (!isvalidpassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // token generating
    const newToken = jwt.sign({ userId: user._id }, config.jwtSKey);
    res.cookie("token", newToken);

    return res.status(200).json({
      message: "user logged in succesfully",
      user,
      token: newToken,
    });
  } catch (error) {
    res.status(400).json({
      message: error,
    });
  }
};

export const logout = async (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(400).json({
      message: "Invalid token",
    });
  }
  const blacklistedToken = await blacklistModel.create({
    token,
  });

  res.clearCookie("token");

  return res.status(200).json({ message: "Logged Out" });
};

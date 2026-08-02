import mongoose from "mongoose";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const start = async (req, res) => {
  if (req.user) {
    return res.status(200).json(new ApiResponse(200, req.user, "User Found"));
  } else {
    return res.status(404).json(new ApiResponse(404, null, "Use Not Found"));
  }
};

const registerUser = async (req, res) => {
  console.log("Registration Started");
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    console.log("Registration Failed data insufficeient ");
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          "Please provide all required fields: fullName, email, and password."
        )
      );
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("Registration Failed already registered user");
      return res
        .status(409)
        .json(new ApiError(409, "User already registered."));
    }

    const newUser = await User.create({
      fullName,
      email,
      password,
    });

    console.log("Registration Successful");
    res.status(201).json(
      new ApiResponse(
        201,
        {
          user: {
            id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
          },
        },
        "User successfully registered."
      )
    );
  } catch (err) {
    console.log("Registration Failed due to server error");
    console.error("Error while creating user:", err);
    const msg =
      err?.name === "MongooseServerSelectionError"
        ? "Database connection failed. Please check MONGODB_URI in Render settings."
        : err?.message || "Internal Server Error.";
    return res
      .status(500)
      .json(new ApiError(500, msg, [], err.stack));
  }
  // return res.status(200).send("Hello WOrld")
};

const loginUser = async (req, res) => {
  console.log("Login Started");
  const { email, password } = req.body;

  if (!email || !password) {
    console.log("Login Failed: Missing required fields");
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          "Please provide all required fields: email and password."
        )
      );
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log("Login Failed: User not found");
      return res.status(404).json(new ApiError(404, "User not found."));
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      console.log("Login Failed: Invalid credentials");
      return res.status(406).json(new ApiError(406, "Invalid credentials."));
    }

    const secretKey =
      process.env.JWT_SECRET_KEY || "super_secret_jwt_key_resume_builder_2026";
    const secretExpiresIn = process.env.JWT_SECRET_EXPIRES_IN || "7d";

    const jwtToken = jwt.sign({ id: user.id }, secretKey, {
      expiresIn: secretExpiresIn,
    });

    const cookieOptions = {
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      sameSite: process.env.NODE_ENV === "Dev" ? "lax" : "none",
      secure: process.env.NODE_ENV === "Dev" ? false : true,
    };

    console.log("Login Successful");
    return res
      .cookie("token", jwtToken, cookieOptions)
      .status(200)
      .json(
        new ApiResponse(
          200,
          {
            user: {
              id: user._id,
              email: user.email,
              fullName: user.fullName,
            },
          },
          "User logged in successfully."
        )
      );
  } catch (err) {
    console.log("Login Failed: Server error");
    console.error("Error during login:", err);
    const msg =
      err?.name === "MongooseServerSelectionError"
        ? "Database connection failed. Please check MONGODB_URI in Render settings."
        : err?.message || "Internal Server Error";
    return res.status(500).json(new ApiError(500, msg, [], err.stack));
  }
};

const logoutUser = (req, res) => {
  console.log("Logged out");
  if (req.user) {
    return res
      .clearCookie("token")
      .status(200)
      .json(new ApiResponse(200, null, "User logged out successfully."));
  } else {
    return res.status(404).json(new ApiError(404, "User not found."));
  }
};

export { start, loginUser, logoutUser, registerUser };

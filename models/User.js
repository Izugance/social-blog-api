import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";

import { LikedPost } from "./LikedPost.js";
import { Follow } from "./Follow.js";
import { StatusCodes } from "http-status-codes";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Please provide a first name"],
    minlength: 2,
    maxlength: 20,
  },
  lastName: {
    type: String,
    required: [true, "Please provide a last name"],
    minlength: 2,
    maxlength: 20,
  },
  email: {
    type: String,
    unique: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please provide a valid email",
    ],
    required: [true, "Please provide an email"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
  },
  numLikedPosts: {
    type: Number,
    default: 0,
  },
});

userSchema.pre("save", async function (next) {
  const saltRounds = 12;
  const salt = await bcrypt.genSalt(saltRounds);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.genJWT = async function () {
  return jwt.sign(
    { userId: this._id, userName: this.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_LIFETIME }
  );
};

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.statics.getUserFollowing = async (userId, skip, limit) => {
  const following = await Follow.find({ following: userId })
    .skip(skip)
    .limit(limit)
    .select("followed");
  return following;
};

userSchema.statics.getUserFollowers = async (userId, skip, limit) => {
  const followers = await Follow.find({ followed: userId })
    .skip(skip)
    .limit(limit)
    .select("following");
  return followers;
};

// We assume that a user doesn't care about liked comments. If the reverse is
// a requirement, unifying the 'LikedPost' and 'LikedComment' tables into one
// (say, 'Like') could be better to limit the number of db queries to get all
// user likes.
userSchema.statics.getUserLikedPosts = async (
  userId,
  skip = null,
  limit = null
) => {
  const likedPosts = await LikedPost.find({ user: userId })
    .skip(skip)
    .limit(limit)
    .select("post");
  return likedPosts;
};

export const User = mongoose.model("User", userSchema);

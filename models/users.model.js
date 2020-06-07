const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const joi = require("joi");
require("dotenv").config({ path: "../.env" });

const jwtSecret = process.env.JWT_SECRET;

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    school: {
      type: String,
      required: true,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    friendIds: {
      type: [String],
      default: [],
    },
    wechatId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, //when model is created
  }
);

UserSchema.methods.generateAccessToken = (userId) => {
  const payload = { userId: userId };
  const token = jwt.sign(payload, jwtSecret);
  return token;
};

const User = mongoose.model("User", UserSchema);

const validateSignup = (user) => {
  const schema = {
    firstName: joi.string().min(1).max(50).required(),
    lastName: joi.string().min(1).max(50).required(),
    email: joi.string().min(5).max(255).required().email(),
    password: joi.string().min(6).max(255).required(),
    school: joi.string().min(1).max(255).required(),
    wechatId: joi.string().min(1).max(255).required(),
  };

  return joi.validate(user, schema);
};

const validateLogin = (user) => {
  const schema = {
    email: joi.string().min(5).max(255).required().email(),
    password: joi.string().min(6).max(255).required(),
  };

  return joi.validate(user, schema);
};

module.exports = {
  User: User,
  validateSignup: validateSignup,
  validateLogin: validateLogin,
};

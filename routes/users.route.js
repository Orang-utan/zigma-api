var express = require("express");
var router = express.Router();
const bcrypt = require("bcryptjs");
const {
  User,
  validateSignup,
  validateLogin,
} = require("../models/users.model");

const auth = require("../middleware/auth");
const { validateEmailDomain, validateCornell } = require("../utils/verify");

// user signup
router.post("/signup", async (req, res) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const password = req.body.password;
  const school = req.body.school;
  const wechatId = req.body.wechatId;

  // validate data
  const { error } = validateSignup(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  // check cornell
  if (validateCornell(email))
    return res
      .status(400)
      .json({ error: "Please transfer to a real Ivy League." });

  // check school domain
  if (!validateEmailDomain(email))
    return res.status(400).json({ error: "School is not available yet." });

  // check registered or not?
  let user = await User.findOne({ email: email });
  if (user) return res.status(400).json({ error: "User already registered" });

  const newUser = new User({
    firstName,
    lastName,
    email,
    password,
    school,
    wechatId,
  });

  const salt = await bcrypt.genSalt(10);
  newUser.password = await bcrypt.hash(password, salt);

  await newUser.save();

  res.status(200).json({ message: "User created" });
});

// user login
router.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // validate data
  const { error } = validateLogin(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const user = await User.findOne({ email: email });
  if (!user) {
    return res
      .status(400)
      .json({ error: "Either email or password is incorrect" });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res
      .status(400)
      .json({ error: "Either email or password is incorrect" });
  }

  // generate token here
  const accessToken = user.generateAccessToken(user._id);

  return res.json({ accessToken: accessToken, user: user });
});

// who am i
router.get("/me", auth, async (req, res) => {
  const user = await User.findById({ _id: req.userId }).select("-password");
  res.json({ user: user });
});

// TODO: send verification email route

// TODO: verify email

// reset password
// input: user email
router.post("/reset-password", async (req, res) => {
  const email = req.body.email;

  res.json({ message: "Email Sent!" });
});

module.exports = router;

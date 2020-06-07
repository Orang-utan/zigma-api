var express = require("express");
var router = express.Router();
const bcrypt = require("bcryptjs");
const {
  User,
  validateSignup,
  validateLogin,
} = require("../models/users.model");

const auth = require("../middleware/auth");

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

  let user = await User.findOne({ email: email });
  if (!user) {
    return res
      .status(400)
      .json({ error: "Either email or password is incorrect" });
  }

  const valid = bcrypt.compare(password, user.password);
  if (!valid) {
    return res
      .status(400)
      .json({ error: "Either email or password is incorrect" });
  }

  // generate token here
  const accessToken = user.generateAccessToken(user._id);

  user = await User.findOne({ email: email }).select("-password");

  res.json({ accessToken: accessToken, user: user });
});

// who am i
router.get("/me", auth, async (req, res) => {
  const user = await User.findById({ _id: req.userId }).select("-password");
  res.json({ user: user });
});

module.exports = router;

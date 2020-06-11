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
const { PROFILE_IMAGE_CONTAINER_NAME, STORAGE_BASE_URL } = require("../config");
const multer = require("multer"),
  inMemoryStorage = multer.memoryStorage(),
  uploadStrategy = multer({ storage: inMemoryStorage }).single("image"),
  azureStorage = require("azure-storage"),
  blobService = azureStorage.createBlobService(),
  getStream = require("into-stream"),
  containerName = PROFILE_IMAGE_CONTAINER_NAME;

// user signup
router.post("/signup", async (req, res) => {
  const firstName = req.body.firstName,
    lastName = req.body.lastName,
    email = req.body.email,
    password = req.body.password,
    school = req.body.school,
    wechatId = req.body.wechatId;

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

  // TODO: send verification email here

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
  const refreshToken = user.generateRefreshToken(user.tokenVersion);

  return res.json({
    accessToken: accessToken,
    refreshToken: refreshToken,
    user: user,
  });
});

// who am i
router.get("/me", auth, async (req, res) => {
  const user = await User.findById({ _id: req.userId }).select("-password");
  res.json({ user: user });
});

// get user based on id
router.get("/:id", async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById({ _id: userId }).select("-password");
  res.json({ user: user });
});

// upload profile image
router.post("/upload-profile", auth, uploadStrategy, async (req, res) => {
  const getBlobName = (originalName) => {
    const identifier = Math.random().toString().replace(/0\./, ""); // remove "0." from start of string
    return `${identifier}-${originalName}`;
  };

  const blobName = getBlobName(req.file.originalname);
  const stream = getStream(req.file.buffer);
  const streamLength = req.file.buffer.length;
  const userId = req.userId;

  blobService.createBlockBlobFromStream(
    containerName,
    blobName,
    stream,
    streamLength,
    async (err, result) => {
      if (err) {
        return res.status(400).json({ error: err });
      }

      const user = await User.findById({ _id: userId });
      user.profileImageUrl = `${STORAGE_BASE_URL}/${containerName}/${result.name}`;

      try {
        await user.save();
        return res
          .status(200)
          .json({ message: "Profile image uploaded succesfully!" });
      } catch (err) {
        return res.status(400).json({ error: err });
      }
    }
  );
});

// TODO: verify email
router.get("/verify-email/:id", async (req, res) => {
  const verificationCode = req.params.id;

  // check if verification code matches users

  res.json({ message: "User verified!" });
});

// reset password
// input: user email
router.post("/reset-password", async (req, res) => {
  const email = req.body.email;

  res.json({ message: "Email Sent!" });
});

module.exports = router;

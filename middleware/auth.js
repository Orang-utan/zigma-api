const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "../.env" });

const jwtSecret = process.env.JWT_SECRET;

const auth = (req, res, next) => {
  const accessToken = req.header("access-token");

  if (!accessToken) {
    return res.status(401).json({ error: "Access denied. No token provided" });
  }

  try {
    const data = jwt.verify(accessToken, jwtSecret);
    req.userId = data.userId;
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid token." });
  }
};

module.exports = auth;

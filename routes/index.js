var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Zigma" });
});

router.get("/hello", function (req, res) {
  res.json({ Hello: "World!" });
});

module.exports = router;

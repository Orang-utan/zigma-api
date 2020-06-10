var express = require("express");
var router = express.Router();
const bcrypt = require("bcryptjs");
const { Queue } = require("../models/queue.model");
const { getBeijingTime, getBreakDownTime } = require("../utils/date");

const auth = require("../middleware/auth");

router.post("/join", async (req, res) => {
  const userId = req.body.userId;
  const { monthNow, dateNow, hourNow } = getBreakDownTime(getBeijingTime());

  if (0 <= hourNow && hourNow < 21) {
    // from 00:00 ~ 20:59
    const todayDate = `${monthNow}/${dateNow}`;
    const targetQueue = await Queue.findOne({ date: todayDate });

    if (targetQueue) {
      // if a queue exist for today, add to the queue userID
      targetQueue.userIds.push(userId);
      targetQueue
        .save()
        .then(() => {
          return res.status(200).json({
            message: "Added to queue!",
            count: targetQueue.userIds.length,
          });
        })
        .catch((err) => {
          return res.status(500).json({ error: err });
        });
    } else {
      // if it doesn't exist for today, construct a new Queue
      const newQueue = new Queue({
        date: todayDate,
        userIds: [userId],
      });
      await newQueue.save();
      return res
        .status(200)
        .json({ message: "Added to queue!", count: newQueue.userIds.length });
    }
  } else {
    // from 21:00 ~ 23:59
    const tomorrow = new Date();
    tomorrow.setDate(new Date().getDate() + 1);
    const tomorrowDate = `${tomorrow.getMonth() + 1}/${tomorrow.getDate()}`;
    const targetQueue = await Queue.findOne({ date: tomorrowDate });

    if (targetQueue) {
      targetQueue.userIds.push(userId);
      targetQueue
        .save()
        .then(() => {
          return res.status(200).json({
            message: "Added to queue!",
            count: targetQueue.userIds.length,
          });
        })
        .catch((err) => {
          return res.status(500).json({ error: err });
        });
    } else {
      // if it doesn't exist for today, construct a new Queue
      const newQueue = new Queue({
        date: tomorrowDate,
        userIds: [userId],
      });
      await newQueue.save();
      return res
        .status(200)
        .json({ message: "Added to queue!", count: newQueue.userIds.length });
    }
  }
});

module.exports = router;

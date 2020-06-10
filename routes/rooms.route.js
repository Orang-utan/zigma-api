var express = require("express");
var router = express.Router();
const { getBeijingTime, getBreakDownTime } = require("../utils/date");

const { Room } = require("../models/rooms.model");
const { Queue } = require("../models/queue.model");

// join room
router.post("/join", async (req, res) => {
  const category = req.body.category;
  const userId = req.body.userId;

  // check whether party has started or not
  const { monthNow, dateNow, hourNow } = getBreakDownTime(getBeijingTime());
  if (0 <= hourNow && hourNow < 21) {
    return res.status(400).json({ error: "Party has not started yet." });
  } else {
    // if party has started, check if user is in the queue
    const todayDate = `${monthNow}/${dateNow}`;
    const targetQueue = await Queue.findOne({ date: todayDate });

    // if not in queue, does not allow user to enter
    if (!targetQueue.userIds.includes(userId)) {
      return res
        .status(400)
        .json({ error: "Sorry. You have not registered for today's party." });
    }
  }

  // search for existing rooms that match category
  const allRooms = await Room.find();

  let targetRoom = null;
  allRooms.forEach((val, idx) => {
    if (val.peerIds.length < 4 && val.category === category) {
      targetRoom = val;
      return;
    }
  });

  if (targetRoom) {
    // if there are any empty ones, join it
    targetRoom.peerIds.push(userId);
    targetRoom
      .save()
      .then(() => {
        return res.status(200).json({ room: targetRoom });
      })
      .catch((err) => {
        return res.status(400).json({ error: err });
      });
  } else {
    // if there are no empty ones, create a new room
    const newRoom = new Room({
      category,
      peerIds: [userId],
    });

    await newRoom.save();

    res.status(200).json({ room: newRoom });
  }
});

// get room status
router.get("/:id", async (req, res) => {
  const roomId = req.params.id;

  Room.findById({ _id: roomId })
    .then((room) => {
      if (room) {
        return res.status(200).json({ room: room });
      } else {
        return res.status(400).json({ error: "Room does not exist" });
      }
    })
    .catch((err) => {
      res.status(400).json({ error: err });
    });
});

// leave room
router.post("/leave", async (req, res) => {
  const userId = req.body.userId;
  const roomId = req.body.roomId;

  const targetRoom = await Room.findById({ _id: roomId });

  // check if user id exist in the room
  if (!targetRoom.peerIds.includes(userId)) {
    return res.status(400).json({ error: "User Id is not in room!" });
  }

  const resultIds = targetRoom.peerIds.filter((val) => val != userId);
  targetRoom.peerIds = resultIds;

  // check if there's no one in the room, if true, delete room
  if (targetRoom.peerIds.length < 1) {
    Room.findByIdAndDelete({ _id: roomId })
      .then(() => {
        return res
          .status(200)
          .json({ message: "Room is empty and thus deleted." });
      })
      .catch((err) => {
        return res.status(400).json({ error: err });
      });
  }

  targetRoom
    .save()
    .then(() => {
      res.status(200).json({ message: "Leave room succesfully" });
    })
    .catch((err) => {
      res.status(400).json({ error: err });
    });
});

module.exports = router;

var express = require("express");
var router = express.Router();
const { getBeijingTime, getBreakDownTime } = require("../utils/date");
const { getRandomPrompt } = require("../utils/prompts");
const { TESTING } = require("../config");

const { Room } = require("../models/rooms.model");
const { Queue } = require("../models/queue.model");

// get all rooms (for testing only)
router.get("/", (req, res) => {
  if (!TESTING) {
    return res
      .status(400)
      .json({ error: "Illegal operation. Ony valid during testing." });
  }

  Room.find({}, (err, rooms) => {
    if (err) {
      return res.status(500).json({ error: err });
    } else {
      return res.status(200).json({ rooms: rooms });
    }
  });
});

// delete all rooms (for testing only)
router.get("/delete-all", (req, res) => {
  if (!TESTING) {
    return res
      .status(400)
      .json({ error: "Illegal operation. Ony valid during testing." });
  }

  Room.deleteMany({}, (err) => {
    if (err) {
      return res.status(500).json({ error: err });
    } else {
      return res.status(200).json({ message: "All rooms are deleted!" });
    }
  });
});

// join room
router.post("/join", async (req, res) => {
  const category = req.body.category;
  const userId = req.body.userId;
  const { monthNow, dateNow, hourNow } = getBreakDownTime(getBeijingTime());
  if (!TESTING) {
    // check whether party has started or not

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
  }

  // search for existing rooms that match category
  const allRooms = await Room.find();

  // remove user id from all other rooms today
  for (let i = 0; i < allRooms.length; i++) {
    const roomMonth = allRooms[i].createdAt.getMonth() + 1;
    const roomDate = allRooms[i].createdAt.getDate();

    if (
      allRooms[i].peerIds.includes(userId) &&
      roomMonth == monthNow &&
      roomDate == dateNow
    ) {
      const resultIds = allRooms[i].peerIds.filter((val) => val != userId);
      allRooms[i].peerIds = resultIds;
      await allRooms[i].save();
    }
  }

  // find a room that has less than 5 members, and is the desired category
  let targetRoom = null;
  allRooms.forEach((val) => {
    const roomMonth = val.createdAt.getMonth() + 1;
    const roomDate = val.createdAt.getDate();

    if (
      val.peerIds.length < 4 &&
      val.category === category &&
      roomMonth == monthNow &&
      roomDate == dateNow
    ) {
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
      prompts: [
        {
          prompt: getRandomPrompt(),
        },
      ],
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

  // check if room exists
  if (!targetRoom) {
    return res.status(400).json({ error: "Room does not exist." });
  }

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

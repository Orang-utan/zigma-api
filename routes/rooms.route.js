var express = require("express");
var router = express.Router();

const { Room } = require("../models/rooms.model");

router.get("/join", async (req, res) => {
  const category = req.body.category;
  const userId = req.body.userId;

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
      res.status(200).json({ room: room });
    })
    .catch((err) => {
      res.status(400).json({ error: err });
    });
});

router.get("/leave", async (req, res) => {});
module.exports = router;

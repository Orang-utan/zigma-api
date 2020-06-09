const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const RoomSchema = new Schema(
  {
    category: {
      type: String,
      required: true,
    },
    peerIds: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true, //when model is created
  }
);

const Room = mongoose.model("Room", RoomSchema);

module.exports = {
  Room: Room,
};

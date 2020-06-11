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
    prompts: {
      type: [
        {
          prompt: {
            type: String,
            required: true,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      required: true,
      default: [],
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

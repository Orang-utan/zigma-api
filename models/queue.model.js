const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const QueueSchema = new Schema({
  date: { type: String, required: true },
  userIds: { type: [String], required: true, default: [] },
});

const Queue = mongoose.model("Queue", QueueSchema);

module.exports = {
  Queue: Queue,
};

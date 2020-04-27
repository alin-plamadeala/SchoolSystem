const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const HashSchema = new Schema(
  {
    _userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    hash: {
      type: String,
      required: true,
      trim: true,
    },
    expire: {
      type: Date,
      index: { expireAfterSeconds: 21600 }, // 6 hours
      default: Date.now(),
    },
  },
  {
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  }
);

const Hash = mongoose.model("hash", HashSchema);
mongoose.model("hash").ensureIndexes(function (err) {
  console.log("ensure index", err);
});
module.exports = Hash;

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    newEmail: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "student",
      enum: ["student", "teacher", "admin"],
    },
    group: {
      type: String,
    },
    accessToken: {
      type: String,
    },
    active: {
      type: Boolean,
      default: false,
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

UserSchema.virtual("fullName").get(function () {
  return this.firstName + " " + this.lastName;
});
const User = mongoose.model("user", UserSchema);

module.exports = User;

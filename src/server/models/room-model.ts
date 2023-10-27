import { Schema, Types, model } from "mongoose";

const roomSchema = new Schema(
  {
    roomtype: {
      type: String,
      enum: ["private", "public"],
      required: true,
      default: "private",
      trim: true,
    },

    users: [
      {
        type: Types.ObjectId,
        required: true,
        ref: "user",
      },
    ],

    messages: [
      {
        type: Types.ObjectId,
        required: false,
        ref: "message",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default model("room", roomSchema);

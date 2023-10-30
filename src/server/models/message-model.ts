import { Schema, Types, model } from "mongoose";

const messageSchema = new Schema(
  {
    room: {
      type: Types.ObjectId,
      required: true,
      ref: "room",
    },

    sender: {
      type: Types.ObjectId,
      required: true,
      ref: "user",
    },

    receiver: {
      type: Types.ObjectId,
      required: true,
      ref: "user",
    },

    attachment: {
      type: Types.ObjectId,
      required: false,
      ref: "file",
    },

    text: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model("message", messageSchema);

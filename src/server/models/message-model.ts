import { Schema, Types, model } from "mongoose";

const messageSchema = new Schema(
  {
    roomId: {
      type: String,
      required: true,
      // ref: "room",
    },

    sender: {
      type: String,
      required: true,
      // ref: "user",
    },

    receiver: {
      type: String,
      required: true,
      // ref: "user",
    },

    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model("message", messageSchema);

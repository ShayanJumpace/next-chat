import { Schema, Types, model } from "mongoose";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },

    userRooms: [
      {
        type: Types.ObjectId,
        required: false,
        ref: "room",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default model("user", userSchema);

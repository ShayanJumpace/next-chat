import mongoose from "mongoose";

export function setupDB() {
  mongoose
    .set({
      strictQuery: true,
    })
    .connect(process.env.DB!, {})
    .then(() => {})
    .catch((error: Error) => console.log(error.message));
}

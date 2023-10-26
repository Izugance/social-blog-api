import mongoose from "mongoose";
import "dotenv/config";

export default async () => {
  let db = await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to the DB");
  return db.connection;
};

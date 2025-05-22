import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const DB_URL = process.env.DB_URL;

export async function connectDB() {
  try {
    await mongoose.connect(DB_URL);
    console.log("Connected with DB");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected on host: ", conn.connection.host);
  } catch (error) {
    console.error("ERROR: DB CONNECTION", err.message);
    process.exit(1);
  }
};

export default connectDB;

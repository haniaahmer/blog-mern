import mongoose from "mongoose";

const connectDB = async () => {
  const maxRetries = 3;
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        connectTimeoutMS: 10000,
        serverSelectionTimeoutMS: 10000,
      });
      console.log(`Connected to MongoDB: ${conn.connection.host}, Database: ${conn.connection.name}`);
      return;
    } catch (error) {
      attempts++;
      console.error(`MongoDB Connection Attempt ${attempts} Failed: ${error.message}`);
      if (attempts === maxRetries) {
        console.error("Max retries reached. Exiting...");
        process.exit(1);
      }
      await new Promise((resolve) => setTimeout(resolve, 5000)); // 5-second delay
    }
  }
};

export default connectDB;
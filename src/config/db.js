import mongoose from "mongoose";

const connectDB = async (uri) => {
  try {
    // Skip auto-connection in test environment
    if (process.env.NODE_ENV === "test") {
      return;
    }

    // Use provided URI or fallback to env
    const connectionUri = uri || process.env.MONGO_URI;
    
    // Only connect if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connectionUri);
      console.log("MongoDB connected");
    }
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;

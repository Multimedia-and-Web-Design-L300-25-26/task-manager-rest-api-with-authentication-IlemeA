import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let mongoServer;
let app;

// Create a function to initialize the app with the in-memory MongoDB
export const setupTestDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  await mongoose.connect(uri);
  console.log("Test MongoDB connected");
  
  // Import app after MongoDB is connected
  const { default: testApp } = await import("../src/app.js");
  app = testApp;
  
  return app;
};

export const cleanupTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
};

export const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

export const getApp = () => app;

// Initialize before all tests - only once
beforeAll(async () => {
  app = await setupTestDB();
}, 30000);

afterAll(async () => {
  await cleanupTestDB();
}, 30000);

// Don't clear database between tests - tests should be independent but can share data

export default app;


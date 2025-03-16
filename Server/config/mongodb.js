import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // No need to include useNewUrlParser or useUnifiedTopology in modern Mongoose versions
    });
    console.log("Mongoose connected to DB");

   
  } catch (error) {
    console.error("Error connecting to the database:", error.message);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;

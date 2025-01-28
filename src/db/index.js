import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

const connectdb = async () => {
    try {
     
        const connectionInstance = await mongoose.connect(`${process.env.MONGOURL}`);
        console.log(`Connected to MongoDB: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("ERROR connecting to MongoDB:", error.message);
    }
};

export default connectdb;

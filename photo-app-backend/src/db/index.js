import mongoose from "mongoose";
import { DBNAME } from "../constant.js";

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(`${process.env.MONGO_URI}/${DBNAME}`);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log("Mongo db connection error",error.message);
        process.exit(1);
        
    }
}


// Export the connectDB function for use in other files
import mongoose from "mongoose";

let initialized = false;

export const connect = async () => {
    mongoose.set("strict", true);
    if (initialized) {
        console.log("mongoDB is already initialized")
        return
    }

    try {

        await mongoose.connect(process.env.MONGODB_URL, {
            dbName: "realestate",
            bufferCommands: true,
            connectTimeoutMS: 30000,
        });
        initialized = true;
        console.log("mongoDB connection successful")
    } catch (error) {
        console.log("mongoDB connection error: ", error)
    }
}

const MONGODB_URL = process.env.MONGODB_URL;


let cached = (global).Mongoose;
if (!cached) {
    cached = (global).mongoose = {
        conn: null,
        promise: null,
    };
}

export const connectDB = async () => {
    if (cached.conn) return cached.conn;

    cached.promise =
        cached.promise ||
        mongoose.connect(process.env.MONGODB_URL, {
            dbName: "realestate",
            bufferCommands: true,
            connectTimeoutMS: 30000,
        });

    cached.conn = await cached.promise;

    return cached.conn;
};

export const connectMongoDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection.asPromise();
    }
    return await mongoose.connect(process.env.MONGODB_URL);
};

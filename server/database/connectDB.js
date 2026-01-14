import mongoose from "mongoose";

const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING;

async function connectToRegisteredUsersDB(){
    try {
        const connectionInstance = await mongoose.connect(`${DB_CONNECTION_STRING}/users`);
        console.log("DB connected successfully || PORT: " + connectionInstance.connection.port);
        
    } catch (error) {
        console.log("Error connecting to registeredUsers database!!!");
    }
}

export default connectToRegisteredUsersDB;
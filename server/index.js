import "dotenv/config"
import app from "./app.js";
import connectToRegisteredUsersDB from "./database/connectDB.js";


const PORT = process.env.SERVER_PORT || 8080;

connectToRegisteredUsersDB().
    then((response) => {
        app.listen(PORT, () => console.log("Server listening at PORT : " + PORT));
    }).catch((error) => console.log("Something went wrong while starting the server!!!"));
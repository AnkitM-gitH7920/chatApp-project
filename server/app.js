import "dotenv/config";
import express from "express";

let app = express();

app.get("/", (req, res) => {
    return res
    .status(200)
    .json({message: "API Hit success"});
})

export default app;
import "dotenv/config";
import express from "express";
import { rateLimit } from 'express-rate-limit'

let app = express();

app.use(express.json({ limit: "10kb" }));
app.use(express.static("public"));


const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 10,
})
app.use(limiter);

import generalRouter from "./routes/general.routes.js";
import authRouter from "./routes/authSecuredRoutes.routes.js";
app.use("/v1", generalRouter);
app.use("/v1/auth", authRouter);


export default app;
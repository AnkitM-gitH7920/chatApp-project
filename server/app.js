import "dotenv/config";
import express from "express";
import { rateLimit } from 'express-rate-limit'
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

let app = express();

app.use(express.static(path.join(path.dirname(fileURLToPath(import.meta.url)), "public")))
app.use(cors({
	origin: "http://localhost:5713",
	methods: ["GET", "POST", "PUT", "DELETE"],
	credentials: true
}));
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: "10kb" }));
app.use(express.static("public"));
app.use(cookieParser());

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 10,
})
app.use(limiter);

import generalRouter from "./routes/general.routes.js";
import authRouter from "./routes/authRoutes.routes.js";
app.use("/v1", generalRouter);
app.use("/v1/auth", authRouter);


export default app;
import express from "express";
import { basicRequest } from "../controllers/generalController.controllers.js";

const generalRouter = express.Router();

generalRouter.route("/").get(basicRequest);

export default generalRouter;
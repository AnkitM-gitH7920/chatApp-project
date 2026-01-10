import express from "express";
import { signupController, loginController } from "../controllers/authController.controllers.js";
import expressFormatValidator from "../middlewares/expressValidator.js";

const authRouter = express.Router();

authRouter.route("/signup").post(expressFormatValidator, signupController);
authRouter.route("/login").post(loginController)

export default authRouter;
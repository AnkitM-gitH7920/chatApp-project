import express from "express";
import { rateLimit } from "express-rate-limit";
import { signupController, loginController, requestOTP, verifyOTP } from "../controllers/authController.controllers.js";
import refreshAccessToken from "../controllers/refreshAccessToken.controller.js";

// middlewares
import expressFormatValidator from "../middlewares/expressValidator.js";
import verifyJWTToRequestOTP from "../middlewares/verifyTempAuthTokenToReqOTP.js";
import verifyJWTToVerifyOTP from "../middlewares/verifyTempAuthTokenToVerifyOTP.js";

const authRouter = express.Router();

const loginAttemptLimiter = rateLimit({
    windowMs: 60 * 15 * 1000,
    limit: 5
})
const requestOTPAttemptLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 10
})
const verifyOTPAttemptLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 10
})
const refreshAccessTokenAttemptLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 5
})


authRouter.route("/signup").post(expressFormatValidator, signupController);
authRouter.route("/login").post(loginAttemptLimiter, expressFormatValidator, loginController);
authRouter.route("/login/request-otp").post(requestOTPAttemptLimiter, verifyJWTToRequestOTP, requestOTP);
authRouter.route("/login/verify-otp").post(verifyOTPAttemptLimiter, verifyJWTToVerifyOTP, verifyOTP);
authRouter.route("/login/refresh").post(refreshAccessTokenAttemptLimiter, refreshAccessToken);

export default authRouter;
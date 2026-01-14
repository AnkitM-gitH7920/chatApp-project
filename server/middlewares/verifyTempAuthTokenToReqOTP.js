import asyncHandler from "../utilities/asyncHandler.js";
import jwt from "jsonwebtoken";
import APIError from "../utilities/APIError.js";


const verifyJWTToRequestOTP = asyncHandler(async (req, res, next) => {
    let authTokenToRequestOTP = req.cookies?.authTokenToRequestOTP || req.header("authTokenToRequestOTP");

    if (!authTokenToRequestOTP) {
        return res
            .status(401)
            .json(new APIError(401, "Unauthorised to request OTP, try logging in again"));
    }
    let decodedData = jwt.verify(authTokenToRequestOTP, process.env.JWT_SECRET, function (err, decoded) {
        if (decoded.purpose !== "SIGNUP_OTP") {
            return res
                .status(403)
                .json(new APIError(403, "You are not allowed to access this resource"))
        }
        if (err) {
            if (err.name === "TokenExpiredError") {
                return res
                    .status(401)
                    .json(new APIError(401, "Your session has expired. Please log in again to request a new OTP"))
            }
            if (err.name === "JsonWebTokenError") {
                return res
                    .status(401)
                    .json(new APIError(401, "For security reasons, please log in again."))
            }
            if (err.name === "NotBeforeError") {
                return res
                    .status(401)
                    .json(new APIError(401, "If the issue persists, try refreshing the page or contact support."))
            }


            return res
                .status(500)
                .json(new APIError(500, err?.message || "Something went wrong, please try again later"));
        }

        return decoded;
    });

    req.requestOTPDecodedToken = decodedData;
    next();
});

export default verifyJWTToRequestOTP;
import asyncHandler from "../utilities/asyncHandler";
import jwt from "jsonwebtoken";
import APIError from "../utilities/APIError";
import User from "../models/users.models";
import APIResponse from "../utilities/APIResponse";

const refreshAccessToken = asyncHandler(async (req, res) => {
    let refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        return res
            .status(401)
            .json(new APIError(401, "Something went wrong, logging in again will fix the issue"));
    }

    let decodedData;
    try {
        decodedData = jwt.verify(refreshToken, process.env.JWT_REFRESHTOKEN_SECRET);
        console.log(decodedData);
        if (!decodedData) {
            return res
                .status(401)
                .json(new APIError(401, "Refresh token missing, please login again"));
        }

        if (decodedData.purpose !== "ACCESS") {
            return res
                .status(403)
                .json(new APIError(403, "You are not allowed to access this resource"));
        }

    } catch (JWTError) {
        if (JWTError.name === "TokenExpiredError") {
            return res
                .status(401)
                .json(new APIError(401, "Your session has been expired, please login again to use the resource"));
        }
        if (JWTError.name === "JsonWebTokenError") {
            return res
                .status(401)
                .json(new APIError(401, "For security reasons, please log in again."))
        }
        if (JWTError.name === "NotBeforeError") {
            return res
                .status(401)
                .json(new APIError(401, "If the issue persists, try refreshing the page or contact support."))
        }

        return res
            .status(500)
            .json(new APIError(500, `Error : ${JWTError.message}` || "Something went wrong, please try again later"));
    }

    let newAccessToken;
    try {
        let storedUser = await User.findById(decodedData.userID);
        if (!storedUser || !storedUser.refreshToken === refreshToken) {
            return res
                .status(401)
                .json(new APIError(401, "Your session has been expired, please login again to use the resource"));
        }

        newAccessToken = jwt.sign(
            {
                userID: storedUser._id,
                email: storedUser.email,
                purpose: "ACCESS",
                isVerified: true
            }, process.env.JWT_ACCESSTOKEN_SECRET, { expiresIn: "15m" }
        )
        if(!newAccessToken){
            return res
            .status(500)
            .json(new APIError(500, "Something went wrong while generating new access token"));
        }


    } catch (mongoDBError) {
        console.log(mongoDBError.message)
    }


    return res
    .status(200)
    .cookie("accessToken", newAccessToken, {
        httpOnly: true,
        maxAge: 15 * 60 * 1000,
        secure: true
    })
    .json(new APIResponse(true, 200, "ACCESS_TOKEN_REFRESHED"));
})

export default refreshAccessToken;
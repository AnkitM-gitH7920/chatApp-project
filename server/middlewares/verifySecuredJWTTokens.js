import APIError from "../utilities/APIError";
import asyncHandler from "../utilities/asyncHandler";
import jwt from "jsonwebtoken";

const verifySecuredJWTTokens = asyncHandler(async (req, res, next) => {
    let accessToken = req.cookies?.accessToken || req.header("Authorization").split(" ")[1];

    if (!accessToken) {
        return res
            .status(401)
            .json(new APIError(401, "You are not authorized, please relogin"));
    }

    let decodedData;
    try {
        decodedData = jwt.verify(accessToken, process.env.JWT_ACCESSTOKEN_SECRET);
        if (decodedData.purpose !== "ACCESS") {
            return res
                .status(401)
                .json(new APIError(401, "You are not authorized, please relogin"));
        }

    } catch (JWTError) {
        console.log(JWTError);
        if (JWTError.name === "TokenExpiredError") {
            return res
                .status(401)
                .json(new APIError(401, "Access token expired", "ACCESS_TOKEN_EXPIRED"))
                // Front end will call /refresh after this to get a new access token
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
        .json(new APIError(500, `Error : ${JWTError.message}` || "Something went wrong, please try again later", JWTError.name));
    }

    req.decodedAccessTokenData = decodedData;
    next();
});


export default verifySecuredJWTTokens;
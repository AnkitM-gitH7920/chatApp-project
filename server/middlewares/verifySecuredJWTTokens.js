import APIError from "../utilities/APIError";
import asyncHandler from "../utilities/asyncHandler";
import jwt from "jsonwebtoken";

/*
     TODO :-
      1. Take Access Token from cookies/ Authorization header
      2. Check if its accessToken not a temporary token (purpose => "ACCESS")
      3. check if  user is verified or not
      4. If access token valid, give access to resource
      4. If expired, retreive refresh Token from DB and cookies
      5. If both refresh Token matched, and valid :- give new access token
      6. If Refresh token is expired, ask for relogin (Session expired)
*/

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
                .json(new APIError(401, "ACCESS_TOKEN_EXPIRED"))
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

    req.decodedAccessTokenData = decodedData;
    next();
})
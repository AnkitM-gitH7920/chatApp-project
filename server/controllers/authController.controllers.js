import asyncHandler from "../utilities/asyncHandler.js";
import APIResponse from "../utilities/APIResponse.js";
import APIError from "../utilities/APIError.js";
import { validationResult } from "express-validator";
import generalPasswordFormatSchema from "../utilities/passwordValidator.js";
import User from "../models/users.models.js";

const generateAccessAndRefreshTokens = (user) => {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    if(!accessToken || !refreshToken){
        return res
        .status(500)
        .json(new APIError(500, "Cannot registered user at the moment, please try again later"));
    }

    return { accessToken, refreshToken }
}


const signupController = asyncHandler(async (req, res) => {
    let { email, password } = req.body;

    email = email.trim();        // remove all spaces
    password = password.trim();  // remove all spaces

    if (!email.length || !password.length) {
        return res
            .status(400)
            .json(new APIError(400, "Fields are incomplete"))
    }

    let errors = validationResult(req);
    if (!errors.isEmpty() && errors.errors[0].path === "email") {
        return res
            .status(400)
            .json(new APIError(400, errors.errors[0].msg))
    }

    if (!generalPasswordFormatSchema.validate(password)) {
        return res
            .status(400)
            .json(new APIError(400, "Password is weak, keep a password with atleast 10 characters"));
    }


    try {
        const alreadyRegistered = await User.findOne({ email: email });
        if (alreadyRegistered) {
            return res
                .status(400)
                .json(new APIError(409, "User already exists"));
        }
    } catch (error) {
        console.log(error.message);
        return res
            .status(500)
            .json(new APIError(500, "Its not you, server got some issues, Please try again later"));
    }

    let createdUser;
    try {
        createdUser = await User.create({
            email: email,
            password: password
        });
        const { accessToken, refreshToken } = generateAccessAndRefreshTokens(createdUser);
        console.log(accessToken, refreshToken)
        createdUser.refreshToken = refreshToken;
        await createdUser.save();

        // !! Start by fixing:- user.generateAccessToken() is not a func.

    } catch (error) {
        console.log(error.message);
        return res
            .status(500)
            .json(new APIError(500, "Something went wrong while registering the user"));
    }

    if (!createdUser) {
        return res
            .status(500)
            .json(new APIError(500, "Something went wrong, please try again later"));
    }

    return res
        .status(200)
        .json(new APIResponse(true, 200, "User registered successfully", createdUser))
})

const loginController = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json({ message: "Login API HIT SUCCESS" })
})


export {
    signupController,
    loginController
}
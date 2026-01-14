import User from "../models/users.models.js";
import OtpStorage from "../models/otpStorage.model.js";
import asyncHandler from "../utilities/asyncHandler.js";
import APIResponse from "../utilities/APIResponse.js";
import APIError from "../utilities/APIError.js";
import { validationResult } from "express-validator";
import generalPasswordFormatSchema from "../utilities/passwordValidator.js";
import generateAccessAndRefreshTokens from "../utilities/genAccessAndRefToken.js";
import { sendHtmlMail } from "../utilities/sendMails.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const convertOTPToString = (enteredOTP) => {
  return typeof (enteredOTP) === "string" ? enteredOTP : enteredOTP.toString();
}

// @To handle registering the user after validating and filtering user input from mallicious scripts
const signupController = asyncHandler(async (req, res) => {
  let { email, password } = req.body;

  email = email.trim();
  password = password.trim();

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
    await User.create({
      email: email,
      password: password
    })

  } catch (mongoDBError) {
    if (mongoDBError.code === 11000) {
      if (mongoDBError.keyValue?.email) {
        let alreadyRegisteredMailAddress = mongoDBError.keyValue?.email;
        return res
          .status(409)
          .json(new APIError(409, `${alreadyRegisteredMailAddress} is already registered`))
      }
    }
    return res
      .status(500)
      .json(new APIError(500, "Something went wrong while registering the user"));
  }

  // !! Provide a temporary token to user so that he could be verified at the login page

  return res
    .status(200)
    .json(new APIResponse(true, 200, "User registered successfully"));
})

// @Provide temporary authorization token to the user, to allow the user to proceed further and request otp from server
const loginController = asyncHandler(async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json(new APIError(400, "Email and password are required"));
  }

  const errors = validationResult(req);
  if (!errors.isEmpty() && errors.errors[0].path === "email") {
    return res
      .status(400)
      .json(new APIError(400, errors.errors[0].msg));
  }

  let loggedInUser;
  try {
    loggedInUser = await User.findOne({ email: email });
    if (!loggedInUser) {
      loggedInUser = null;
      return res
        .status(404)
        .json(new APIError(404, "User not found"));
    }

    const compareResult = await loggedInUser.compareEncryptedPassword(password);
    if (!compareResult) {
      return res
        .status(401)
        .json(new APIError(401, "Email and password combination is incorrect"));
    }

  } catch (mongoDBError) {
    console.log(mongoDBError);
    return res
      .status(500)
      .json(new APIError(500, "Something went wrong, please try again later"));
  }

  const authTokenToRequestOTP = jwt.sign({
    userID: loggedInUser._id,
    purpose: "SIGNUP_OTP",
    isVerified: false
  }, process.env.JWT_SECRET,
    {
      expiresIn: "5m"
    })
  if (!authTokenToRequestOTP) {
    return res
      .status(500)
      .json(new APIError(500, "Something went wrong, cannot verify OTP at the moment"))
  }


  return res
    .status(200)
    .cookie("authTokenToRequestOTP", authTokenToRequestOTP, { sameSite: "strict", maxAge: 5 * 60 * 1000, httpOnly: true })
    .json(new APIResponse(true, 200, "User found and verified"));
});

// @To handle request for providing the OTP to the user via nodemailer and storing otp in the database
const requestOTP = asyncHandler(async (req, res) => {
  let { userMailAddress } = req.body;
  let decodedData = req?.requestOTPDecodedToken;

  if (!decodedData) {
    return res
      .status(500)
      .json(new APIError(500, "Something went wrong, please try again later"));
  }

  let userID = decodedData.userID;
  let OTP = (crypto.randomInt(100000, 1000000)).toString();
  let OTPHash = await bcrypt.hash(OTP, 10);
  try {
    const storedHashedOTPDocument = await OtpStorage.findOneAndUpdate(
      { userID },
      {
        OTPHash: OTPHash,
        expiresAt: new Date(Date.now() + 2 * 60 * 1000)
      },
      {
        upsert: true,
        new: true
      }
    );

    if (!storedHashedOTPDocument) {
      return res
        .status(500)
        .json(new APIError(500, "Something went wrong, please try again later"));
    }

  } catch (mongoDBError) {
    console.log(mongoDBError);
    return res
      .status(500)
      .json(new APIError(500, "Something went wrong while securing your account. Please try again later."));
  }

  const subject = `Your OTP for login is : ${OTP}`;
  const OTPMailBody = `
       <!DOCTYPE html>
         <html>
           <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
             <div style="width:100%;padding:40px 0;background-color:#f4f6f8;">
               <div style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:8px;box-shadow:0 6px 20px rgba(0,0,0,0.08);overflow:hidden;">
        
                 <!-- Header -->
                 <div style="background-color:#4f46e5;padding:30px;text-align:center;">
                   <h1 style="margin:0;color:#ffffff;font-size:26px;">OTP Verification</h1>
                 </div>

                 <!-- Body -->
                 <div style="padding:30px;color:#333333;line-height:1.6;">
                   <h2 style="margin-top:0;font-size:22px;color:#111827;">Verify Your Email Address</h2>
          
                   <p style="font-size:15px;">
                     Hello,
                   </p>

                   <p style="font-size:15px;">
                     We received a request to verify your email address. Please use the One-Time Password (OTP) below to complete your verification process.
                   </p>

                   <!-- OTP -->
                   <div style="margin:30px 0;text-align:center;">
                     <div style="display:inline-block;padding:16px 32px;font-size:32px;font-weight:bold;letter-spacing:6px;color:#4f46e5;background-color:#eef2ff;border-radius:6px;">
                       ${OTP}
                     </div>
                   </div>

                   <p style="font-size:15px;">
                     This OTP is valid for <strong>5 minutes</strong>. Please do not share this code with anyone for security reasons.
                   </p>

                   <div style="margin-top:25px;padding:16px;background-color:#f9fafb;border-left:4px solid #4f46e5;">
                     <p style="margin:6px 0;font-size:14px;">
                       • If you did not request this verification, please ignore this email.
                     </p>
                     <p style="margin:6px 0;font-size:14px;">
                                • For your security, our team will never ask for your OTP.
                     </p>
                   </div>

                   <p style="margin-top:25px;font-size:14px;color:#6b7280;">
                     If you are having trouble, please contact our support team, by contacting us @ ankitmehra7920@gmail.com
                   </p>
                 </div>

                 <!-- Footer -->
                 <div style="padding:20px;text-align:center;background-color:#f9fafb;color:#6b7280;font-size:13px;">
                   © 2026 Your Company. All rights reserved.
                 </div>

               </div>
             </div>
           </body>
         </html>
    `;
  try {
    await sendHtmlMail(userMailAddress, subject, OTPMailBody);

  } catch (nodemailerError) {
    await OtpStorage.findByIdAndDelete(userID);
    return res
      .status(500)
      .json(new APIError(500, "Email service temporarily unavailable"));

  }

  const authTokenToVerifyOTP = jwt.sign({
    userID: userID,
    purpose: "SIGNUP_OTP",
    isVerified: false
  }, process.env.JWT_SECRET,
    { expiresIn: "5m" }
  );

  return res
    .status(200)
    .cookie("authTokenToVerifyOTP", authTokenToVerifyOTP, { sameSite: "strict", maxAge: 5 * 60 * 1000, httpOnly: true })
    .json(new APIResponse(true, 200, "OTP Provided and stored"));

});

// @To handle for verifying the entered OTP
const verifyOTP = asyncHandler(async (req, res) => {
  let decodedData = req.verifyOTPDecodedToken;
  let { enteredOTP } = req.body;

  if (!decodedData) {
    return res
      .status(401)
      .json(new APIError(401, "Unauthorized to verify OTP, try to login again"));
  }

  if (!enteredOTP) {
    return res
      .status(400)
      .json(new APIError(400, "OTP is required."))
  }
  if (!typeof (enteredOTP) === "number") {
    return res
      .status(400)
      .json(new APIError(400, "OTP should be a 6-digit number"))
  }
  if (!enteredOTP.toString().length === 6) {
    return res
      .status(400)
      .json(new APIError(400, "OTP must contain exactly 6 digits"))
  }

  try {
    const OTP = convertOTPToString(enteredOTP);
    const storedOTP = await OtpStorage.findOne({ userID: decodedData.userID });
    const isOTPCorrect = await storedOTP.compareHashedOTP(OTP);

    if (!isOTPCorrect) {
      return res
        .status(400)
        .json(new APIError(400, "Incorrect OTP"));
    }

  } catch (mongoDBError) {
    console.log(mongoDBError);
    return res
      .status(500)
      .json(new APIError(500, "Something went wrong with database"));
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens();
  if (!accessToken || !refreshToken) {
    return res
      .status(500)
      .json(new APIError(500, "Something went wrong while generating access and refresh tokens"));
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
      secure: true
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      secure: true
    })
    .json(new APIResponse(true, 200, "User logged in successfully"));
})

export {
  signupController,
  loginController,
  requestOTP,
  verifyOTP
}
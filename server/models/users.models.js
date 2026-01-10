import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowerCase: true, // can throw an error
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    loggedInOn: {
        type: Date,
        required: true,
        default: Date.now
    },
    loggedOffOn: {
        type: Date,
        required: false,
        default: null
    },
    refreshToken: {
        type: String,
        required: false,
        trim: true,
    }
}, { timestamps: true })

let User = mongoose.model("user", userSchema);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    const salt = bcrypt.genSalt(10);
    this.password = await bcrypt.hash(password, 10);
    next();
});

userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        id: this._id
    }, process.env.JWT_ACCESSTOKEN_SECRET, 
    { expiresIn: "15m" }
)}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        id: this._id
    }, process.env.JWT_ACCESSTOKEN_SECRET, 
    { expiresIn: "20d" }
)}

export default User;
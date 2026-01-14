import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    loggedInOn: {
        type: Date,
        required: false,
        default: null
    },
    loggedOffOn: {
        type: Date,
        required: false,
        default: null
    },
    refreshToken: {
        type: String,
        required: false,
        default: null
    }
}, { timestamps: true });

userSchema.pre("save", async function () {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
        return;
    }

    return;
})

userSchema.methods.compareEncryptedPassword = async function (password) {
    const compareResult = await bcrypt.compare(password, this.password);
    return compareResult;
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        userID: this._id,
        email: this.email,
        purpose: "ACCESS",
        isVerified: true
    }, process.env.JWT_ACCESSTOKEN_SECRET,
        { expiresIn: "15m" }
    )
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        userID: this._id,
        purpose: "ACCESS",
        isVerified: true
    }, process.env.JWT_REFRESHTOKEN_SECRET,
        { expiresIn: "30d" }
    )
}


let User = mongoose.model("user", userSchema);

export default User;
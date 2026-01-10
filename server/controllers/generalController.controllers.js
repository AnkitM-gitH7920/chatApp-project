import asyncHandler from "../utilities/asyncHandler.js";

const basicRequest = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json({message: "/ API hit success"})
})

export { basicRequest }
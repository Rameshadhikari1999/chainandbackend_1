import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";


export const verifyJWT = asyncHandler(async (req, _, next) => {

    try {
        const token = req.cookies?.accessToken || req.headers("Authorization")?.replace("Bearer ", "");
        //  console.log(token, "token");
        if (!token) {
            throw new ApiError("Unauthorized request", 401);
        }
    
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        // console.log(decoded, "decoded");
        const user = await User.findById(decoded?.id).select("-password -refreshToken");
        // console.log(user, "user");
        if(!user) {
            throw new ApiError("Invalid access token", 401);
        }
    
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(error?.message || "Unauthorized request", 401);
    }
})
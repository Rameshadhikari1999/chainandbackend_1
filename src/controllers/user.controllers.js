import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  //  get users details from frontend
  // check vilations - not empty
  // check if user exists: userName , email
  // check for images, avatar
  // upload them cloudinary, avatar
  // create user object - create db entry
  // remove password and refresh token
  // check of user creation successful
  // return response

  const { userName, fullName, email, password } = req.body;

  if (
    [userName, fullName, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError("All fields are required", 400);
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { userName }],
  });
  if (existedUser) {
    throw new ApiError("User already exists", 409);
  }

  // console.log(req.files, 'req.files');
  const avatarLoacalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let converImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    converImageLocalPath = req.files?.coverImage[0]?.path;
  }


  if (!avatarLoacalPath) {
    throw new ApiError("Avatar file is required", 400);
  }
  const avatar = await uploadOnCloudinary(avatarLoacalPath);
  const coverImage = await uploadOnCloudinary(converImageLocalPath);
  
  if (!avatar) {
    throw new ApiError("Avatar upload failed", 400);
  }

  const user = await User.create({
    userName: userName.toLowerCase(),
    fullName,
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError("Something went wrong while creating user", 500);
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "User created successfully", createdUser));
});

export { registerUser };

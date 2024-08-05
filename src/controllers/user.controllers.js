import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      "Something went wrong at generating access and refresh tokens",
      500
    );
  }
};

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
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
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

const loginUser = asyncHandler(async (req, res) => {
  // get users details from frontend
  // check vilations - not empty
  // check if user exists: userName , email
  // generate access & refresh token
  // set cookies
  // return response
  const { userName, email, password } = req.body;
  if (!(userName || email)) {
    throw new ApiError("email or username required", 400);
  }

  const user = await User.findOne({ $or: [{ email }, { userName }] });
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const isPasswordMatch = user.comparePassword(password);
  if (!isPasswordMatch) {
    throw new ApiError("Incorrect password", 401);
  }

  const { accessToken, refreshToken } = await getAccessAndRefreshTokens(user._id);

  const logedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {

    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "User logged in successfully", {
        user: logedInUser,
        accessToken,
        refreshToken,
      })
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 },
    },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
 return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200,{}, "User logged out successfully"));
});

export { registerUser, loginUser, logoutUser };

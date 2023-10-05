const User = require("../models/user");
const Company = require("../models/company");

const ErrorHandler = require("../utilis/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utilis/jwtToken");
const sendEmail = require("../utilis/sendResetEmail");
const crypto = require("crypto");
const { authorizeRoles } = require("../middleware/auth");
const APIFeatures = require("../utilis/APIFeatures");

// Login User  =>  /api/v1/login

exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  //Check if email and password entered by user
  if (!email || !password) {
    return next(new ErrorHandler("Please enter email and password", 400));
  }

  //Finding user in Database

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid Email and Password", 401));
  }

  //Check if entered password is correct or not
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Entered Password is wrong!", 401));
  }

  sendToken(user, 200, res);
});

// Forgot Password => /api/v1/password/forgot

exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found with this email", 404));
  }

  //Get Reset Token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  //Create Reset Password URL
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;
  const message = `Dear ${user.name},\n\nYou recently requested for a password reset from your Vigorous Fitness account.You can find your link below and reset your password easily.\n\n${resetUrl}\n\nIf it wasn't you who requested for a password reset, or accidentally made a request, ignore this email.Worry not, your password won't be changed unless initiated by you.\n\nStay fit!\nTeam Vigorous Health and Fitness.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Account Reset Password",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message, 500));
  }
});

// Reset Password => /api/v1/password/reset:token

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  try {
    //Hash URL Token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (req.body.password !== req.body.confirmPassword) {
      return next(new ErrorHandler("Password does not match", 400));
    }

    if (!user) {
      return next(
        new ErrorHandler("Password reset token is invalid or expired", 400)
      );
    }

    //Setup for New Password
    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
  } catch (error) {
    next(error);
  }
});

//Get currently logged in user data  /api/v1/currentUser

exports.currentUser = catchAsyncErrors(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
});

//Update User Profile /api/v1/user_profile/edit_profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  try {
    const newUserData = {
      name: req.body.name,
      email: req.body.email,
      phoneNo: req.body.phoneNo,
      companyName: req.body.companyName,
    };

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
});

//Update User Password  /api/v1/password/update_password

exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("+password");

    //Check User Previous Password
    const isMatched = await user.comparePassword(req.body.oldPassword);
    if (!isMatched) {
      return next(ErrorHandler("Old Password is incorrect", 400));
    }
    user.password = req.body.password;
    await user.save();
    sendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
});

// Logout User  =>  /api/v1/logout

exports.logout = catchAsyncErrors(async (req, res, next) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "Logged Out Successfully",
    });
  } catch (error) {
    next(error);
  }
});

// Admin Route

// Register a user => /api/v1/admin/register

exports.registerUser = catchAsyncErrors(async (req, res) => {
  const { name, email, password, phoneNo, companyName } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    phoneNo,
    companyName,
  });

  Company.create({
    companyName,
    user: user._id,
  });

  sendToken(user, 200, res);
});

//Get All user ===> /api/v1/admin/all_user

exports.allUsers = catchAsyncErrors(async (req, res, next) => {
  const resPerPage = parseInt(req.query.limit) || 10;
  const usersCount = await User.countDocuments(); //Passing the data into frontend
  const apiFeatures = new APIFeatures(User.find({}), req.query)
    .search()
    .filter()
    .sort()
    .pagination(resPerPage);
  const users = await apiFeatures.query;

  res.status(200).json({
    success: true,
    count: users.length,
    usersCount,
    users,
  });
});

//Get All user ===> /api/v1/admin/user/:id
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(
      ErrorHandler(`User does not found with this id: ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

//Update User ===> /api/v1/admin/user/:id
exports.updateUser = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    phoneNo: req.body.phoneNo,
    companyName: req.body.companyName,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  if (!user) {
    return next(
      ErrorHandler(`User does not found with this id: ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
  });
});

//Delete User ===> /api/v1/admin/user/:id
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(
      ErrorHandler(`User does not found with this id: ${req.params.id}`)
    );
  }

  //Remove Profile Pic from Cloudinary - TODO
  await user.remove();

  res.status(200).json({
    success: true,
  });
});

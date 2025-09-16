const express = require("express");
const { upload } = require("../multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const catchAsyncError = require("../middleware/catchAsyncError");
const sendToken = require("../utils/jwtToken");
const router = express.Router();
const User = require("../model/user");
const ErrorHandler = require("../utils/ErrorHandler");
const sendMail = require("../utils/sendMail");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const cloudinary = require("cloudinary");

// CREATE A USER
router.post("/create-user", async (req, resp, next) => {
  try {
    const { name, email, password, avatar } = req.body;
    // 🔹 avatar must be a BASE64 string or image URL

    // 🔎 Check if user already
    const userEmail = await User.findOne({ email });
    if (userEmail) {
      return next(new ErrorHandler("User already exists", 400));
    }
    let myCloud;
    if (avatar) {
      // ✅ Upload base64 image directly to Cloudinary
      myCloud = await cloudinary.v2.uploader.upload(avatar, {
        folder: "avatars",
      });
    }

    // ✅ Build user object
    const user = {
      name,
      email,
      password,
      avatar: {
        public_id: myCloud?.public_id || "",
        url: myCloud?.secure_url || "",
      },
    };

    // ✅ Generate activation token
    const activationToken = createActivationToken(user);
    const activationUrl = `https://multivender-kzk1.vercel.app/activation/${activationToken}`;

    // ✅ Send activation email
    await sendMail({
      email: user.email,
      subject: "Activate your account",
      message: `Hello ${user.name}, please click the link to activate your account: ${activationUrl}`,
    });

    resp.status(201).json({
      success: true,
      message: `Please check your email (${user.email}) to activate your account.`,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});
// CREATE ACTIVATION TOKEN
const createActivationToken = (user) => {
  return jwt.sign(
    {
      name: user.name,
      email: user.email,
      password: user.password,
      avatar: user.avatar,
    },
    process.env.ACTIVATION_SECRET,
    {
      expiresIn: "2h",
    }
  );
};

// ACTIVATE OUR USER
router.post(
  "/activation",
  catchAsyncError(async (req, resp, next) => {
    const { activation_token } = req.body;

    const newUser = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);
    console.log("Decoded token:", newUser);

    try {
      const newUser = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET
      );
      if (!newUser) {
        return next(new ErrorHandler("Invalid Token"));
      }
      const { name, email, password, avatar } = newUser;
      let user = await User.findOne({ email });
      if (user) {
        return next(new ErrorHandler("user already exists", 400));
      }

      user = await User.create({
        name,
        email,
        avatar,
        password,
      });
      sendToken(user, 201, resp);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
    console.log("Decoded activation token:", newUser);
    console.log("Token received:", activation_token);
  })
);

// LOGIN USER
router.post(
  "/login-user",
  catchAsyncError(async (req, resp, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return next(new ErrorHandler("Please provide all feilda", 400));
      }
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return next(new ErrorHandler("User dosn't esists!", 400));
      }
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return next(
          new ErrorHandler("Please provide correct information", 400)
        );
      }

      sendToken(user, 201, resp);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// LOAD USER
router.get(
  "/getuser",
  isAuthenticated,
  catchAsyncError(async (req, resp, next) => {
    try {
      const user = await User.findById(req.user._id);

      if (!user) {
        return next(new ErrorHandler("User doen't exists", 400));
      }
      resp.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// LOGOUT METHOD
router.post(
  "/logout",
  isAuthenticated,
  catchAsyncError(async (req, res, next) => {
    try {
      // Clear only the user token
      res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });

      // Set CORS and cache headers
      res.set({
        "Access-Control-Allow-Origin": "https://multivender-kzk1.vercel.app",
        "Access-Control-Allow-Credentials": "true",
        "Cache-Control": "no-store, no-cache, must-revalidate, private",
      });

      res.status(200).json({
        success: true,
        message: "User logged out successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// UPDATE USER DETAILS
router.put(
  "/update-user-info",
  isAuthenticated,
  catchAsyncError(async (req, resp, next) => {
    try {
      const { email, password, phoneNumber, name } = req.body;
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return next(new ErrorHandler("User not found", 400));
      }
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return next(
          new ErrorHandler("Please provide correct information", 400)
        );
      }

      user.name = name;
      user.email = email;
      user.phoneNumber = user.phoneNumber;
      await user.save();
      resp.status(201).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

router.put(
  "/update-avatar",
  isAuthenticated,
  upload.single("image"), // frontend must send "image"
  catchAsyncError(async (req, res, next) => {
    if (!req.file) {
      return next(new ErrorHandler("No file uploaded", 400));
    }

    const existsUser = await User.findById(req.user.id);

    // 🔥 Delete old avatar from Cloudinary if exists
    if (existsUser.avatar && existsUser.avatar.public_id) {
      await cloudinary.uploader.destroy(existsUser.avatar.public_id);
    }

    // ✅ Upload new avatar to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "avatars",
    });

    // ✅ Save new avatar details
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        avatar: {
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Avatar updated successfully",
      user,
    });
  })
);

export default router;

// UPDATE USER ADDRESSES
router.put(
  "/update-user-addresses",
  isAuthenticated,
  catchAsyncError(async (req, resp, next) => {
    try {
      const user = await User.findById(req.user.id);
      const sameTypeAddress = user.addresses.find(
        (address) => address.addressType === req.body.addressType
      );
      if (sameTypeAddress) {
        return next(
          new ErrorHandler(`${req.body.addressType} address already exists`)
        );
      }

      const existAddress = user.addresses.find(
        (address) => address._id === req.body._id
      );
      if (existAddress) {
        Object.assign(existAddress, req.body);
      } else {
        // ADD THE NEW ADDRESS
        user.addresses.push(req.body);
      }

      await user.save();
      resp.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// DELETE USER ADDRESS
router.delete(
  "/delete-user-address/:id",
  isAuthenticated,
  catchAsyncError(async (req, resp, next) => {
    try {
      const userId = req.user._id;
      const addressId = req.params.id.replace(/^:/, "");
      await User.updateOne(
        {
          _id: userId,
        },
        { $pull: { addresses: { _id: addressId } } }
      );
      const user = await User.findById(userId);
      resp.status(200).json({ success: true, user });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// UPDATE USER PASSWORD

router.put(
  "/update-user-password",
  isAuthenticated,
  catchAsyncError(async (req, resp, next) => {
    try {
      const user = await User.findById(req.user.id).select("+password");

      isPasswordMatch = await user.comparePassword(req.body.oldPassword);
      if (!isPasswordMatch) {
        return next(new ErrorHandler("Old passord is incorrect!", 400));
      }

      if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password does not match!", 400));
      }

      user.password = req.body.newPassword;

      await user.save();
      resp.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// FIND USER INFORMATION BY USING ID

router.get(
  "/user-info/:id",
  catchAsyncError(async (req, resp, next) => {
    try {
      const user = await User.findById(req.params.id);
      resp.status(201).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// GET ALL USERS FOR ---ADMIN
router.get(
  "/admin-all-users",
  isAuthenticated,
  isAdmin("Admin"),

  catchAsyncError(async (req, resp, next) => {
    try {
      const users = await User.find().sort({
        createdAt: -1,
      });

      resp.status(200).json({
        success: true,
        users,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// DELETE USERS FOR --ADMIN
router.delete(
  "/delete-user/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncError(async (req, resp, next) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return next(new ErrorHandler("User does not found with this id"));
      }

      resp.status(201).json({
        success: true,
        message: "User deleted sucessfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);
module.exports = router;

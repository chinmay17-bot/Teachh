//required imports
const User = require("../models/user");
const Profile = require("../models/profile");
const OTP = require("../models/otp");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config;

//SendOTP
exports.sendOTP = async (req, res) => {
  try {
    // fetch email
    const { email } = req.body;

    //check if user already exist

    const checkUserPresent = await User.findOne({ email });

    //yes
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "User already exist",
      });
    }

    //no
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("OTP : ", otp);

    //check for unique OTP (IMP)
    //very inefficient code (fix later)
    let result = await OTP.findOne({
      otp: otp,
    });

    //loop is inefficient //may be wrong do check
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({
        otp: otp,
      });
    }

    const otpPayload = { email, otp };

    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//signup
exports.signUp = async (req, res) => {
  try {
    //take data from request body
    //==============================================================================
    //==============================================================================
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      constactNumber,
      otp,
    } = req.body;
    //===============================================================================
    //===============================================================================

    //validation
    //==============================================================================
    //==============================================================================
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "All fields a required",
      });
    }

    if (password != confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password are not matching",
      });
    }
    //==============================================================================
    //==============================================================================

    //check if user exist
    //==============================================================================
    //==============================================================================
    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already registered",
      });
    }
    //==============================================================================
    //==============================================================================

    //find most recent OTP
    const recentOtp = await OTP.find({
      email,
    })
      .sort({
        createdAt: -1,
      })
      .limit(1);

    if (recentOtp.length == 0) {
      //OTP not found
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    } else if (otp !== recentOtp) {
      //Otp not match
      return res.status(400).json({
        success: false,
        message: "OTP not matched",
      });
    }

    //all preprocessing for data checks and otps are dont at this point now we store the user
    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //create entry

    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    return res.status(200).json({
      success: true,
      message: "User is registered Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "User is registered Successfully",
    });
  }
};

//Login

//do revise all functions
exports.login = async (req, res) => {
  try {
    //get data
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "Missing fields",
      });
    }

    //user check
    const user = await User.findOne({ email }).populate("additionalDetails");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not registered",
      });
    }
    //password matching
    if (await bcrypt.compare(password, user.password)) {
      //generate JWT
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });

      user.token = token;
      user.password = undefined;
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      };
      //create cookie and send response
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "Logged in Successfully",
      });
    } else {
      return res.status(401).jsos({
        success: false,
        message: "Incorrect password",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).jsos({
      success: false,
      message: "Login failed",
    });
  }
};

//change password
exports.changePassword = async (req, res) =>{
    //get data from req body
    //get oldpassword , newpassword , confirmnewpassword
    //validation

    //update password in db

    //send mail
    //return response 
} 
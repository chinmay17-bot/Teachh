const User = require("../models/user");
const bcrypt = require("bcrypt");
const mailSender = require("../utils/mailSender");

//reset password token
exports.resetPassword = async (req, res) => {
  try {
    //get email from req
    const email = req.body;

    //check if user exist or not
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(403).json({
        success: false,
        messgae: "User email not registered",
      });
    }
    //generate token
    const token = crypto.randomUUID();

    //update user by addding token
    const updatedDetails = await User.findOneAndUpdate(
      {
        email: email,
      },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      {
        new: true, //to return updated doc
      }
    );
    //url
    const url = `http://localhost:3000/update-password/${token}`;
    //send mail contianing url
    await mailSender(
      email,
      "Password reset link",
      `Password reset link ${url}`
    );
    //return response

    return res.status(200).json({
      success: true,
      message: "Reset password link sent",
    });
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      success: false,
      message: "Some error occured",
    });
  }
};

//=======================================================================================
//=======================================================================================

//reset password
exports.resetPassword = async (req, res, next) => {
  try {
    // data fetch
    // token is also sent in body by front end
    const { password, confirmPassword, token } = req.body;

    // validation
    if (password !== confirmPassword) {
      return res.status(403).json({
        success: false,
        message: "Pssword not matching",
      });
    }

    // get user details from DB
    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Invalid Token",
      });
    }

    // if no entry token is invalid / token is expired
    if (user.resetPasswordExpires < Date.now()) {
      return res.status(403).json({
        success: false,
        message: "Session expired try again",
      });
    }

    //valid then update password after hasing
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findOneAndUpdate(
      {
        token: token,
      },
      {
        password: hashedPassword,
      },
      {
        new: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Password reset succesfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(403).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

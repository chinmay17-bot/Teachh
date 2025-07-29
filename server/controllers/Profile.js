const Profile = require("../models/profile");
const User = require("../models/user");
const CourseProgress = require("../models/courseProgress");
const Course = require("../models/course");
const { convertSecondsToDuration } = require("../utils/secToDuration");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const mongoose = require("mongoose");

exports.updateProfile = async (req, res) => {
  try {
    // how can i schedule a request (find out)

    //get data set default if not provided
    const {
      firstName = "",
      lastName = "",
      dateOfBirth = "",
      about = "",
      contactNumber = "",
      gender = "",
    } = req.body;
    //get userid
    const id = req.user.id;
    //validation
    if (!contactNumber || !gender || !id) {
      res.status(400).json({
        success: false,
        message: "required fields are missing",
        error: error.message,
      });
    }

    //find profile to populate user profile
    const user = await User.findByIdAndUpdate(id ,{
      firstName,
      lastName
    });
    const userDetails=await User.findbyId(id);

    await user.save();
    const profileId = userDetails.additionalDetails;

    const profileDetails = await Profile.findById(profileId);

    //update
    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.gender = gender;
    profileDetails.contactNumber = contactNumber;

    //update
    await profileDetails.save();

    const updatedUserDetails = await User.findById(id).populate("additionalDetails").exec();

    return res.status(200).json({
      success: true,
      message: "profile updated",
      data:updatedUserDetails
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    //get id
    const id = req.user.id;
    console.log(id);
    //validation

    const userDetails = await User.findById({_id:id});
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    //delete user from the list of enrolled student in courses
    //IMP
    for(const courseId of userDetails.courses){
      await Course.findByIdAndUpdate(
        courseId,
        {$pull:{studentsEnrolled:id}},
        {new:true}
      )
    }

    //what is a crone job

    //delete profile
    await Profile.findByIdAndDelete({ _id: (userDetails.additionalDetails) });

    // this is deprecated
    // await Profile.findByIdAndDelete({ _id: new mongoose.Types.ObjectId(userDetails.additionalDetails) });

    //delete user;
    await User.findByIdAndDelete({ _id: id });

    return res.status(200).json({
      success: true,
      message: "user deleted",
    });

    await CourseProgress.deleteMany(
      {
        userDetails:id
      }
    )
  } catch (error) {
    console.error("Error deleting profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getAllUserDetails = async (req, res) => {
  try {
    const id = req.user.id;

    //validation
    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec();

    return res.status(200).json({
      success: true,
      message: "user details fetched",
    });
  } catch (error) {
    console.error("Error deleting profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

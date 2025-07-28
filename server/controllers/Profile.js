const Profile = require("../models/profile");
const User = require("../models/user");

exports.updateProfile = async (req, res) => {
  try {
    // how can i schedule a request (find out)

    //get data
    const { dateOfBirth = "", about = "", contactNumber, gender } = req.body;
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
    const userDetails = await User.findById(id);
    const profileId = userDetails.additionalDetails;

    const profileDetails = await Profile.findById(profileId);

    //update
    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.gender = gender;
    profileDetails.contactNumber = contactNumber;

    //update
    await profileDetails.save();

    return res.status(200).json({
      success: true,
      message: "subsection deleted",
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
    //validation

    const userDetails = await User.findById(id);
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "Uuser not found",
      });
    }
    //delete user from the list of enrolled student in courses

    //what is a crone job

    //delete profile
    await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });

    //delete user;
    await User.findByIdAndDelete({ _id: id });

    return res.status(200).json({
      success: true,
      message: "user deleted",
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

exports.getAllUserDetails = async (req, res) => {
  try {
    const id= req.user.id;

    //validation
    const userDetails= await User.findById(id).populate("additionalDetails").exec();

    return res.status(200).json(
        {
            success:true,
            message:"user details fetched",
            
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

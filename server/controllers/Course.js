const Course = require("../models/course");
const User = require("../models/user");
const Tag = require("../models/tag");
require("dotenv").config;

const { uploadImageToCloudinary } = require("../utils/imageUploader");

//create course
//complex
exports.createCourse = async (req, res) => {
  try {
    //fetch data
    const { courseName, courseDescription, whatWillYouLearn, price, tag } =
      req.body;

    //get thubmnail
    const thubmnail = req.files.thumbnailImage;

    //validation
    if (
      !courseName ||
      !courseDescription ||
      !whatWillYouLearn ||
      !price ||
      !tag
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    //check for instructor
    const userId = req.user.id;
    const instructorDetails = await User.findById(userId);
    console.log(instructorDetails);

    //TODO CHECK IF USER ID AND INSTRUCTOR ID ARE SAME OR DIFF 


    if (!instructorDetails) {
      return res.status(400).json({
        success: false,
        message: "Instructor not found",
      });
    }

    //tag validation
    const tagDetails = await Tag.findById(tag);
    if (!tagDetails) {
      return res.status(400).json({
        success: false,
        message: "Tag not found",
      });
    }

    //upload image to cloud
    const thumbnailImage = await uploadImageToCloudinary(
      thubmnail,
      process.ENV.FOLDER_NAME
    );

    //create course
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatWillYouLearn: whatWillYouLearn,
      price,
      tag: tagDetails._id,
      thubmnail: thumbnailImage.secure_url,
    });

    //add the new course for the instructor
    await User.findByIdandUpdate(
      {
        _id: instructorDetails._id,
      },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      {
        new: true,
      }
    );

    //MAY BE WRONG
    await Tag.findByIdandUpdate(
      {
        _id: tag,
      },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      {
        new: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Successfully added Course",
    });
  } catch (error) {
    return res.status(500).json({
      success: fail,
      message: "Failed to create course",
    });
  }
};

//get all courses

exports.getAllCourses = async (req, res) => {
  try {
    // const allCourses = await Course.find(
    //   {},
    //   {
    //     courseName: true,
    //     price: true,
    //     thumbnail: true,
    //     instructor: true,
    //     ratingAndReviews: true,
    //     studentsEnrolled: true,
    //   }
    // )
    //   .populate("instructor")
    //   .exec();

        const allCourses =  await Course.find({});
    return res.status(200).json({
      success: true,
      message: "Successfully fetched Course",
    });

  } catch (error) {
    return res.status(500).json({
      success: fail,
      message: "Failed to get all course",
      error: error.message,
    });
  }
};

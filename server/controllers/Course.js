const Course = require("../models/course");
const User = require("../models/user");
const Category = require("../models/category");
const CourseProgress = require("../models/courseProgress");
const Section = require("../models/section");
const SubSection = require("../models/subSection");
const { convertSecondsToDuration } = require("../utils/secToDuration");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

require("dotenv").config;
//create course
//complex
exports.createCourse = async (req, res) => {
  try {
    //fetch data
    const {
      courseName,
      courseDescription,
      whatWillYouLearn,
      price,
      tag: _tag,
      category,
      status,
      instructions: _instructions,
    } = req.body;

    //get thubmnail
    const thubmnail = req.files.thumbnailImage;

    //convert the stringify array to array
    const tag = JSON.parse(_tag);
    const instructions = JSON.parse(_instructions);

    //validation
    if (
      !courseName ||
      !courseDescription ||
      !whatWillYouLearn ||
      !price ||
      !tag.length ||
      !category ||
      !instructions.length
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if(!status || status=== undefined){
      status="Draft"
    }

    //check for instructor
    const userId = req.user.id;

    //user must be instructor
    const instructorDetails = await User.findById(userId,{
      accountType:"Instructor",
    });
    console.log(instructorDetails);

    //TODO CHECK IF USER ID AND INSTRUCTOR ID ARE SAME OR DIFF

    if (!instructorDetails) {
      return res.status(400).json({
        success: false,
        message: "Instructor not found",
      });
    }

    //tag validation
    const categoryDetails = await Category.findById(category);
    if (!categoryDetails) {
      return res.status(400).json({
        success: false,
        message: "category not found",
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
      tag,
      category: categoryDetails._id,
      thubmnail: thumbnailImage.secure_url,
      status:status,
      instructions
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
    await categoryDetails.findByIdandUpdate(
      {
        _id: category,
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
      data:newCourse,
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

    const allCourses = await Course.find({});
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

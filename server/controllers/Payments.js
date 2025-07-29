const { instance } = require("../config/razorpay");
const User = require("../models/user");
const Course = require("../models/course");
const mailSender = require("../utils/mailSender");

const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");

// capture the payment and initiate the order
exports.capturePayment = async (req, res) => {
  //get details
  const { course_id } = req.body;
  const userId = req.user.id;
  //validations

  //course
  if (!course_id) {
    res.json({
      success: false,
      message: "invalid course course ID",
    });
  }

  let course;
  try {
    course = await Course.findById(course_id);
    if (!course) {
      res.json({
        success: false,
        message: "could noty find course",
      });
    }
    //already pursched or not

    //to convet string to oblect it to compare with the object id in course list
    const uid = new mongoose.Types.ObjectId(userId);

    if (course.studentsEnrolled.includes(uid)) {
      return res.status(200).json({
        success: true,
        message: "alrady bought by student",
      });
    }

  } catch (error) {
    return res.status(500).json({
        success: false,
        message: error.message,
      });
  }
};

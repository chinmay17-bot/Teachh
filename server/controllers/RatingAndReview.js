const RatingAndReview = require("../models/ratingAndReview");
const Course = require("../models/course");
const { Mongoose, default: mongoose } = require("mongoose");

exports.createRating = async (req, res) => {
  try {
    //conditions to be able to review
    // logged in
    // not reviewd previously
    // user has the cpurse

    const { userId } = req.user.id;

    const { rating, review, courseId } = req.body;

    const courseDetails = await Course.findOne({
      _id: courseId,
      //check if user matchs here or not
      studentsEnrolled: { $elemMatch: { $eq: userId } },
    });
    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Student not purachased the course",
      });
    }

    //check if user already reviewd
    const alreadyReviewed = await RatingAndReview.findOne({
      user: userId,
      course: courseId,
    });

    if (alreadyReviewed) {
      return res.status(403).json({
        success: false,
        message: "Student already reviewed",
      });
    }

    //create review
    const ratingReview = await RatingAndReview.create({
      rating,
      review,
      course: courseId,
      user: userId,
    });

    //update it in course

    const updatedCourseDetails = await Course.findByIdAndUpdate(
      { _id: courseId },
      {
        $push: {
          ratinfAndReviews: ratingReview._id,
        },
      },
      { new: true }
    );

    console.log(updatedCourseDetails);

    return res.status(200).json({
      success: true,
      message: "rating and reviewed",
      ratingReview,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//calculate average
exports.getAverageRating = async (req, res) => {
  try {
    //get course
    const courseId = req.body.courseId;
    //get all rating

    // calculate avgerage
    const result = await RatingAndReview.aggregate([
      {
        $match: {
          //to change string to object
          course: new mongoose.Types.ObjectId(courseId),
        },
      },
      {
        $group: {
          //means we group all enrteies in a single grouop
          //we do this whwn we do no know what to group on
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    // return
    if (result.length > 0) {
      return res.status(200).json({
        success: true,
        averageRating: result[0].averageRating,
      });
    }

    //no reviews exist
    return res.status(200).json({
      success: true,
      message: "no ratings given till now",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//getall rating
exports.getAllRating = async (req, res) => {
  try {
    const allReviews = await RatingAndReview.find({})
      .sort({ rating: "desc" })
      .populate({
        path: "user",
        //fields that we need tio populate
        select: "firstName lastName wmail image",
      })
      .populate({
        path: "course",
        select: "courseName",
      })
      .exec();

      return res.status(200).json({
        success: true,
        message:"all reviews fetched",
        data:allReviews
      });
  } catch (error) {
    return res.status(400).json({
        success: false,
        message: error.message,
      });
  }
};

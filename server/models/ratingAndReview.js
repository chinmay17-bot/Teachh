const mongoose = require("mongoose");

const ratingAndReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  rating: {
    type: Number,
    required: true,
  },
  review: {
    type: String,
    required: true,
  },
  course: {
    typr: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Course",
    //         An index will be created on this field in the database.
    // Useful for faster queries that filter or sort based on course.
    index: true,
  },
});
module.exports = mongoose.exports("RatingAndReview", ratingAndReviewSchema);

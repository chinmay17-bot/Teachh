const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true,
    required: true,
  },
  lastName: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  accountType: {
    type: String,
    enum: ["Student", "Admin", "Instructor"],
    required: true,
  },
  active:{
    type:Boolean,
    default:true,
  },
  approved:{
    type:Boolean,
    default:true,
  },
  additionalDetails: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: true,
  },
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  image: {
    type: String,
  },
  token :{
    type:String
  },
  resetPasswordExpires:{
    type:Date
  },
  courseProgess: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CourseProgress",
  }
});

module.exports= mongoose.exports("User", userSchema);

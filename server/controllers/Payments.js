const { instance } = require("../config/razorpay");
const User = require("../models/user");
const Course = require("../models/course");
const mailSender = require("../utils/mailSender");

const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");
const { useTransition } = require("react");

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

  //order cretion
  const amount = course.price;
  const currency = "INR";
  const options = {
    amount: amount * 100,
    currency,
    receipt: Mmath.random(Date.now()).toString(),
    notes: {
      //fetched data
      courseId: course_id,
      userId,
    },
  };

  try {
    //payment process
    // this is only the process to transact payment we have to verfiy/auth this also
    const paymentResponse = await instance.orderes.create(options);
    console.log(paymentResponse);

    return res.status(200).json({
      status: true,
      courseName: course.courseName,
      courseDescription: course_id.courseDescription,
      thumbnail: course.thumbnail,
      orderId: paymentResponse.id,
      currency: paymentResponse.currency,
      amount: paymentResponse.amount,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "could not initiate response",
    });
  }
};

//payment verificatioon
exports.verifySignature = async (req, res) => {
  // 2 signature one from razor pay and one from server
  //this is my signature  from server
  const webhookSecret = "12345678";

  //these name are set by razor pay no alternative
  const signature = req.headers["x-razorpay-signature"];

  //we use crypto t hash our key to verify raxorpays key
  //do check difference between sha and hmac
  //using hashing function sha but e use hmac (hashing algo +secret key)

  //steps
  const shasum = crypto.createHmac("sha256", webhookSecret);
  shasum.update(JSON.stringify(req.body));

  //we change to digest in hexforrmat (digest is bascally called mostly as output of hashing function)
  const digest = shasum.digest("hex");
  if (signature === digest) {
    console.log("payment is authorised");
    //most important after payment verfication
    //its important to know that in this controller we dont ahve course id and user id as its for payment

    //so use use from notes in options that we have sent

    //this is how razor pay sends the data
    const { courseId, userId } = req.body.payload.entity.notes;

    //now update data
    try {
      //find course and enroll studenmt
      const enrolledCourse = await Course.findByIdAndUpdate(
        {
          _id: courseId,
        },
        {
          $push: { studentsEnrolled: userId },
        },
        { new: true }
      );

      if (!enrolledCourse) {
        return res.status(500).json({
          success: false,
          message: "cpurse not found",
        });
      }

      const enrolledStudent= await Student.findByIdAndUpdate(
        {
          _id:userId
        },
        {
          $push: { courses: courseId },
        },
        { new: true }
      );


      //confirmatio mail
      const emailResponse = await mailSender(
           enrolledStudent.email,
           "Congratulations for buying",
           "Congratulations for buying"
      )

      console.log(emailResponse);
      return res.status(200).json(
        {
          success:true,
          message:"signature is verified"
        }
      )
      
    } catch (error) {
      return res.status(500).json(
        {
          success:false,
          message:error.message
        }
      )
    }
  }

  else{
    return res.status(500).json(
        {
          success:false,
          message:error.message
        }
      )
  }
};

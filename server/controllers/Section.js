const Section = require("../models/section");
const SubSection = require("../models/subSection");
const Course = require("../models/course");

exports.createSection = async (req, res) => {
  try {
    //fetch
    const { sectionName, courseId } = req.body;
    //data valiadtion
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "All feilds are required",
      });
    }

    //create second
    const newSection = await Section.create({ sectionName });

    //update course
    const updatedCourseDetails = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      {
        new: true,
      }
    ).populate(
      {
        path:"courseContent",
        populate:{
          path:"subSection"
        }
      }
    ).exec();
    //hw use populate to replace section/subSection both in updated course detatisl
    return res.status(200).json(
        {
            success:true,
            message:"Section created"
        }
    )
  } catch (error) {
    return res.status(500).json(
        {
            success:false,
            message:"Section creation failed"
        }
    )
  }
};

// UPDATE a section
exports.updateSection = async (req, res) => {
  try {
    const { sectionName, sectionId, courseId } = req.body
    const section = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true }
    )
    const course = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()
    console.log(course)
    res.status(200).json({
      success: true,
      message: section,
      data: course,
    })
  } catch (error) {
    console.error("Error updating section:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

// DELETE a section
//todo:do we need to delete the object id from course schema as well (done below)
exports.deleteSection = async (req, res) => {
  try {
    const { sectionId, courseId } = req.params
    await Course.findByIdAndUpdate(courseId ,{
        $pull:{
          courseContent:sectionId
        }
      })
    const section= await Section.findById(sectionId);
    if(!section){
      return res.status(404).json(
        {
          success:false,
          message:"section not found"
        }
      )
    }

    await SubSection.deleteMany({_id:{$in:section.subSection}});
    await Section.findByIdAndDelete(sectionId);

    //update the course
    const course= await Course.findById(courseId).populate(
      {
        path:"courseContent",
        populate:{
          path:"subSection"
        }
      }
    ).exec()

    res.status(200).json({
      success: true,
      message: "Section deleted", 
      data:course
    })

    
  } catch (error) {
    console.error("Error deleting section:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

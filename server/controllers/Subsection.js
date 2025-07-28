//create new subsection
//update subsection
//delete subsection

const Section = require("../models/section");
const SubSection = require("../models/subSection");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
require("dotenv").config;

exports.createSubSection = async (req, res) => {
  try {
    //fetch details
    const { sectionId, title, timeDuration, description } = req.body;
    //for video extract file
    const video = req.files.videoFile;

    //validaiton

    if (!sectionId || !title || !timeDuration || !description) {
      return res.status(500).json({
        success: false,
        message: "All details are required",
      });
    }
    //upload video to cloudinary
    const uploadDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    );

    //create
    const subSectionDetails = await SubSection.create({
      title: title,
      timeDuration: timeDuration,
      description: description,
      videoUrl: uploadDetails.secure_url,
    });

    //find and update the section
    const updatedSection = await Section.findByIdAndUpdate(
      {
        _id: sectionId,
      },
      {
        $push: {
          subSection: subSectionDetails.__id,
        },
      },
      {
        new: true,
      }
    ).populate("subSection");
    return res.status(200).json({
      success: true,
      message: "subsection created",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//check

exports.updateSubSection = async (req, res) => {
  try {
    //fetch details
    const { sectionId, subSectionId, title, description } = req.body;

    //we do it this way as we dont know if all details exits or not
    const subSection = await SubSection.findById(subSectionId);

    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }

    if (title !== undefined) {
      subSection.title = title;
    }

    if (description !== undefined) {
      subSection.description = description;
    }
    if (req.files && req.files.video !== undefined) {
      const video = req.files.video;
      const uploadDetails = await uploadImageToCloudinary(
        video,
        process.env.FOLDER_NAME
      );
      subSection.videoUrl = uploadDetails.secure_url;
      subSection.timeDuration = `${uploadDetails.duration}`;
    }

    // update the subsection
    await subSection.save();

    // find updated section and return it
    const updatedSection = await Section.findById(sectionId).populate(
      "subSection"
    );
    return res.status(200).json({
      success: true,
      message: "subsection updated",
    });
  } catch (error) {
    console.error("Error updating subsection:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.deleteSubSection = async (req, res) => {
  try {
    const { sectionId, subSectionId } = req.body;
    const updateSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $pull: {
          subSection: subSectionId,
        },
      }
    );
    const subSection = await SubSection.findByIdAndDelete({
      _id: subSectionId,
    });

    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "Sub section doesnot exist",
      });
    }

    const updatedSection = await Section.findById(sectionId).populate(
      "subSection"
    );
    return res.status(200).json({
      success: true,
      message: "subsection deleted",
    }); 
  } catch (error) {
    console.error("Error delete subsection:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

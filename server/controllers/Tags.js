const Tag = require("../models/tag");

exports.createTag = async (req, res) => {
  try {
    //fetch
    const { name, description } = req.body;

    //validation
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    //create entry in db
    const tagDetail= await Tag.create({
        name:name,
        description:description
    });
    console.log(tagDetail);

    return res.status(200).json({
        success:true,
        message:"Tag added"
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

//fetch all tags
exports.showAllTags = async (req, res) => {
  try {
    

    //fetch all entry in db
    //makes sure that tag consist name and desc
    const allTags= await Tag.find({}, {name:true, description:true});

    console.log(allTags);
    return res.status(200).json({
        success:true,
        message:"all tags returned added",
        allTags
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
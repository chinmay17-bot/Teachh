const Category = require("../models/category");

function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}

//Change tags to category
exports.createCategory = async (req, res) => {
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
    const categoryDetail = await Category.create({
      name: name,
      description: description,
    });
    console.log(categoryDetail);

    return res.status(200).json({
      success: true,
      message: "category added",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

//fetch all Category
exports.showAllCategory = async (req, res) => {
  try {
    //fetch all entry in db
    //makes sure that tag consist name and desc
    const allCategory = await Category.find(
      {},
      { name: true, description: true }
    );

    console.log(allCategory);
    return res.status(200).json({
      success: true,
      message: "all Category returned added",
      allTags,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


//fetch category and all courses linked to it
exports.categoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.body;

    //fetch courses of that category
    const selectedCategory = await Category.findById(categoryId)
      .populate({
        path: "courses", 
        match: { status: "published" },
        populate: "ratingAndReviews",
      })
      .exec();
    if (!selectedCategory) {
      return res.status(404).json({
        success: false,
        message: "category not found",
      });
    }
    console.log(selectedCategory);
    if (selectedCategory.courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "no course in this category",
      });
    }
    // Get courses for other categories
    const categoriesExceptSelected = await Category.find({
      //get categories not equal to seletecd
      _id: { $ne: categoryId },
    })
    let differentCategory = await Category.findOne(
      categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
        ._id
    )
      .populate({
        path: "courses",
        match: { status: "Published" },
      })
      .exec()
   // Get top-selling courses across all categories

   //check all below this for this functionionality 
    const allCategories = await Category.find()
      .populate({
        path: "courses",
        match: { status: "Published" },
      })
      .exec()
    const allCourses = allCategories.flatMap((category) => category.courses)
    const mostSellingCourses = allCourses
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10)

    res.status(200).json({
      success: true,
      data: {
        selectedCategory,
        differentCategory,
        mostSellingCourses,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "internal server error whil fetching category page details",
    });
  }
};

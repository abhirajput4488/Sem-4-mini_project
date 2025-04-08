const Profile = require("../models/Profile")
const CourseProgress = require("../models/CourseProgress")

const Course = require("../models/Course")
const User = require("../models/User")
const { uploadImageToCloudinary } = require("../utils/imageUploader")
const mongoose = require("mongoose")
const { convertSecondsToDuration } = require("../utils/secToDuration")
// Method for updating a profile
exports.updateProfile = async (req, res) => {//✅
  try {
    const {
      firstName = "",
      lastName = "",
      dateOfBirth = "",
      about = "",
      contactNumber = "",
      gender = "",
    } = req.body
    const id = req.user.id

    // Find the profile by id
    const userDetails = await User.findById(id)
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const profile = await Profile.findById(userDetails.additionalDetails)
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }
    // Update user fields only if provided
    const updatedUserFields = {};
    if (firstName) updatedUserFields.firstName = firstName;
    if (lastName) updatedUserFields.lastName = lastName;

    if (Object.keys(updatedUserFields).length > 0) {
      await User.findByIdAndUpdate(id, updatedUserFields, {
        new: true,
        runValidators: true,
      });
    }

     // Update profile fields only if provided
    if (dateOfBirth) profile.dateOfBirth = dateOfBirth;
    if (about) profile.about = about;
    if (contactNumber) profile.contactNumber = contactNumber;
    if (gender) profile.gender = gender;

    await profile.save();

    // Find the updated user details
    const updatedUserDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec()

    return res.json({
      success: true,
      message: "Profile updated successfully",
      updatedUserDetails,
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

exports.deleteAccount = async (req, res) => {
  try {
    const id = req.user.id
    console.log(id)
    const user = await User.findById({ _id: id })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }
    // Delete Assosiated Profile with the User
    await Profile.findByIdAndDelete({
      _id: new mongoose.Types.ObjectId(user.additionalDetails),
    })
    for (const courseId of user.courses) {
      await Course.findByIdAndUpdate(
        courseId,
        { $pull: { studentsEnroled: id } },
        { new: true }
      )
    }
    // Now Delete User
    await User.findByIdAndDelete({ _id: id })
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    })
    await CourseProgress.deleteMany({ userId: id })
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ success: false, message: "User Cannot be deleted successfully" })
  }
}

//contorller for getting user  all details
exports.getAllUserDetails = async (req, res) => {//✅
  try {
    const id = req.user.id
    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec()
    console.log(userDetails)
    res.status(200).json({
      success: true,
      message: "User Data fetched successfully",
      data: userDetails,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.updateDisplayPicture = async (req, res) => {//✅
  try {

    // Check if a file is uploaded
    if (!req.files || !req.files.displayPicture) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const displayPicture = req.files.displayPicture
    const userId = req.user.id
    //upload image to cloudinary
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    )
    console.log(image)
    const updatedProfile = await User.findByIdAndUpdate(
      { _id: userId },
      { image: image.secure_url },
      { new: true }
    )
    res.send({
      success: true,
      message: `Image Updated successfully`,
      data: updatedProfile,
    })
  } catch (error) {
    console.error("Error updating display picture:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update display picture",
    });
  }
};

exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id
    let userDetails = await User.findOne({
      _id: userId,
    })
      .populate({
        path: "courses",
        populate: {
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        },
      })
      .exec()
    userDetails = userDetails.toObject()
    var SubsectionLength = 0
    for (var i = 0; i < userDetails.courses.length; i++) {
      let totalDurationInSeconds = 0
      SubsectionLength = 0
      for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
        totalDurationInSeconds += userDetails.courses[i].courseContent[
          j
        ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
        userDetails.courses[i].totalDuration = convertSecondsToDuration(
          totalDurationInSeconds
        )
        SubsectionLength +=
          userDetails.courses[i].courseContent[j].subSection.length
      }
      let courseProgressCount = await CourseProgress.findOne({
        courseID: userDetails.courses[i]._id,
        userId: userId,
      })
      courseProgressCount = courseProgressCount?.completedVideos.length
      if (SubsectionLength === 0) {
        userDetails.courses[i].progressPercentage = 100
      } else {
        // To make it up to 2 decimal point
        const multiplier = Math.pow(10, 2)
        userDetails.courses[i].progressPercentage =
          Math.round(
            (courseProgressCount / SubsectionLength) * 100 * multiplier
          ) / multiplier
      }
    }

    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userDetails}`,
      })
    }
    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.instructorDashboard = async (req, res) => {
  try {
    // Get the instructor's ID from the authenticated user
    const instructorId = req.user.id;
    
    if (!instructorId) {
      return res.status(400).json({
        success: false,
        message: "Instructor ID not found"
      });
    }

    // Find all courses for this instructor with populated fields
    const courseDetails = await Course.find({ instructor: instructorId })
      .populate('studentsEnroled')
      .lean(); // Use lean() for better performance

    if (!courseDetails || courseDetails.length === 0) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    const courseData = courseDetails.map((course) => {
      // Ensure studentsEnroled exists and is an array
      const studentsEnroled = Array.isArray(course.studentsEnroled) ? course.studentsEnroled : [];
      const totalStudentsEnrolled = studentsEnroled.length;
      const price = typeof course.price === 'number' ? course.price : 0;
      const totalAmountGenerated = totalStudentsEnrolled * price;

      return {
        _id: course._id,
        courseName: course.courseName || '',
        courseDescription: course.courseDescription || '',
        thumbnail: course.thumbnail || '',
        price: price,
        totalStudentsEnrolled,
        totalAmountGenerated,
      };
    });

    res.status(200).json({
      success: true,
      data: courseData
    });
  } catch (error) {
    console.error("Error in instructorDashboard:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch instructor dashboard data",
      error: error.message
    });
  }
};
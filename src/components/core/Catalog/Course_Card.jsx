import React from 'react'
import { Link } from 'react-router-dom'
import RatingStars from '../../common/RatingStars'
import GetAvgRating from '../../../utils/avgRating'

const Course_Card = ({ course, Height }) => {
  const avgReviewCount = GetAvgRating(course.ratingAndReviews)
  
  return (
    <Link to={`/courses/${course._id}`}>
      <div className="bg-richblack-800 rounded-lg overflow-hidden">
        <div className={`${Height} w-full`}>
          <img 
            src={course?.thumbnail}
            alt={course?.courseName}
            className="h-full w-full object-cover"
          />
        </div>
        
        <div className="p-4">
          <p className="text-xl text-richblack-5">{course?.courseName}</p>
          <p className="text-sm text-richblack-300 mt-2">
            By {course?.instructor?.firstName} {course?.instructor?.lastName}
          </p>
          
          <div className="flex items-center gap-2 mt-2">
            <span className="text-yellow-50">{avgReviewCount || 0}</span>
            <RatingStars Review_Count={avgReviewCount} />
            <span className="text-richblack-400">
              ({course?.ratingAndReviews?.length} ratings)
            </span>
          </div>
          
          <p className="text-xl text-richblack-5 mt-2">₹ {course?.price}</p>
        </div>
      </div>
    </Link>
  )
}

export default Course_Card

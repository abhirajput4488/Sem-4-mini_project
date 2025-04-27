import React, { useEffect, useState } from 'react'
import Footer from '../components/common/Footer'
import { useParams } from 'react-router-dom'
import { apiConnector } from '../services/apiconnector'
import { catalogData } from '../services/apis'
import { getCatalogaPageData } from '../services/operations/pageAndComponentData'
import CourseCard from '../components/core/Catalog/Course_Card'
import CourseSlider from '../components/core/Catalog/CourseSlider'
import { useSelector } from "react-redux"
import Error from "./Error"

const Catalog = () => {
  const { loading } = useSelector((state) => state.profile)
  const { catalogName } = useParams()
  const [active, setActive] = useState(1)
  const [catalogPageData, setCatalogPageData] = useState(null)
  const [categoryId, setCategoryId] = useState("")
  const [categories, setCategories] = useState([])

  // Fetch all categories
  useEffect(() => {
    const getCategories = async () => {
      try {
        const response = await apiConnector("GET", catalogData.CATEGORIES_API)
        console.log("Categories response:", response)
        
        if (response?.data?.success) {
          setCategories(response.data.data)
          // Find the matching category
          const category = response.data.data.find(
            (ct) => ct.name.replace(/\s+/g, '-').toLowerCase() === catalogName.toLowerCase()
          )
          
          if (category) {
            console.log("Found matching category:", category)
            setCategoryId(category._id)
          } else {
            console.log("No matching category found for:", catalogName)
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }
    getCategories()
  }, [catalogName])

  // Fetch category details
  useEffect(() => {
    const getCategoryDetails = async () => {
      try {
        if (!categoryId) {
          console.log("No category ID available")
          return
        }
        
        console.log("Fetching details for category ID:", categoryId)
        const response = await apiConnector("POST", catalogData.CATALOGPAGEDATA_API, {
          categoryId: categoryId,
        })
        console.log("Category details response:", response)

        if (response?.data?.success) {
          setCatalogPageData(response.data)
        }
      } catch (error) {
        console.error("Error fetching category details:", error)
        setCatalogPageData({
          success: true,
          data: {
            selectedCategory: null,
            differentCategory: null,
            mostSellingCourses: [],
          },
        })
      }
    }
    getCategoryDetails()
  }, [categoryId])

  if (loading || !catalogPageData) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!loading && !catalogPageData.success) {
    return <Error />
  }

  return (
    <>
      {/* Hero Section */}
      <div className="box-content bg-richblack-800 px-4">
        <div className="mx-auto flex min-h-[260px] max-w-maxContentTab flex-col justify-center gap-4 lg:max-w-maxContent">
          <p className="text-sm text-richblack-300">
            {`Home / Catalog / `}
            <span className="text-yellow-25">
              {catalogPageData?.data?.selectedCategory?.name}
            </span>
          </p>
          <p className="text-3xl text-richblack-5">
            {catalogPageData?.data?.selectedCategory?.name}
          </p>
          <p className="max-w-[870px] text-richblack-200">
            {catalogPageData?.data?.selectedCategory?.description}
          </p>
        </div>
      </div>

      {/* Categories Section */}
      <div className="mx-auto box-content w-full max-w-maxContentTab px-4 py-12 lg:max-w-maxContent">
        <div className="section_heading">Available Categories</div>
        <div className="my-4 flex flex-wrap gap-4">
          {categories.map((category) => (
            <a
              key={category._id}
              href={`/catalog/${category.name.replace(/\s+/g, '-').toLowerCase()}`}
              className={`px-4 py-2 rounded-md ${
                category._id === categoryId
                  ? "bg-yellow-25 text-richblack-900"
                  : "bg-richblack-700 text-richblack-50"
              }`}
            >
              {category.name}
            </a>
          ))}
        </div>
      </div>

      {/* Course Section */}
      <div className="mx-auto box-content w-full max-w-maxContentTab px-4 py-12 lg:max-w-maxContent">
        <div className="section_heading">Courses to get you started</div>
        <div className="my-4 flex border-b border-b-richblack-600 text-sm">
          <p
            className={`px-4 py-2 ${
              active === 1
                ? "border-b border-b-yellow-25 text-yellow-25"
                : "text-richblack-50"
            } cursor-pointer`}
            onClick={() => setActive(1)}
          >
            Most Popular
          </p>
          <p
            className={`px-4 py-2 ${
              active === 2
                ? "border-b border-b-yellow-25 text-yellow-25"
                : "text-richblack-50"
            } cursor-pointer`}
            onClick={() => setActive(2)}
          >
            New
          </p>
        </div>
        <div>
          <CourseSlider
            Courses={catalogPageData?.data?.selectedCategory?.courses}
          />
        </div>
      </div>

      {/* Top Courses Section */}
      {catalogPageData?.data?.differentCategory?.courses?.length > 0 && (
        <div className="mx-auto box-content w-full max-w-maxContentTab px-4 py-12 lg:max-w-maxContent">
          <div className="section_heading">
            Top courses in {catalogPageData?.data?.differentCategory?.name}
          </div>
          <div className="py-8">
            <CourseSlider
              Courses={catalogPageData?.data?.differentCategory?.courses}
            />
          </div>
        </div>
      )}

      {/* Frequently Bought Section */}
      {catalogPageData?.data?.mostSellingCourses?.length > 0 && (
        <div className="mx-auto box-content w-full max-w-maxContentTab px-4 py-12 lg:max-w-maxContent">
          <div className="section_heading">Frequently Bought</div>
          <div className="py-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {catalogPageData?.data?.mostSellingCourses
                ?.slice(0, 4)
                .map((course, i) => (
                  <CourseCard course={course} key={i} Height={"h-[400px]"} />
                ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}

export default Catalog
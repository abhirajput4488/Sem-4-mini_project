import React from 'react'
import {toast} from "react-hot-toast"
import { apiConnector } from '../apiconnector';
import { catalogData } from '../apis';

export const getCatalogaPageData = async(categoryId) => {
  const toastId = toast.loading("Loading...");
  let result = [];
  try{
        const response = await apiConnector("POST", catalogData.CATALOGPAGEDATA_API, 
        {categoryId: categoryId,});

        if(!response?.data?.success)
            throw new Error("Could not Fetch Category page data");

         result = response?.data;

  }
  catch(error) {
    // Don't show error toast to user
    console.log("CATALOG PAGE DATA API ERROR....", error);
    // Return a success response with empty data instead of error
    result = {
      success: true,
      data: {
        selectedCategory: null,
        differentCategory: null,
        mostSellingCourses: []
      }
    };
  }
  toast.dismiss(toastId);
  return result;
}


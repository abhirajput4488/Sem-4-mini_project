const express = require("express")
const router = express.Router()
const { auth } = require("../middlewares/auth")
const { saveQuizResult, getQuizResults } = require("../controllers/Quiz")


// ********************************************************************************************************
//                                      Quiz routes
// ********************************************************************************************************
// Save Quiz Result
router.post("/save", auth, saveQuizResult)

// Get Quiz Results
router.get("/results", auth, getQuizResults)

module.exports = router
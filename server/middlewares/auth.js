// Importing required modules
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/User");
// Configuring dotenv to load environment variables from .env file
dotenv.config();

// This function is used as middleware to authenticate user requests
exports.auth = async (req, res, next) => {
	try {
		// Extracting JWT from request cookies, body or header
		let token = req.cookies.token || req.body.token;
		
		// Check Authorization header
		const authHeader = req.header("Authorization");
		if (authHeader && authHeader.startsWith("Bearer ")) {
			token = authHeader.substring(7);
		}

		// If JWT is missing, return 401 Unauthorized response
		if (!token) {
			return res.status(401).json({ 
				success: false, 
				message: `Token Missing`,
				debug: {
					cookies: req.cookies,
					authHeader: req.header("Authorization"),
					bodyToken: req.body.token
				}
			});
		}

		try {
			// Verifying the JWT using the secret key stored in environment variables
			const decode = await jwt.verify(token, process.env.JWT_SECRET);
			console.log("Decoded token:", decode);
			// Storing the decoded JWT payload in the request object for further use
			req.user = decode;
		} catch (error) {
			// If JWT verification fails, return 401 Unauthorized response
			console.error("Token verification failed:", error);
			return res
				.status(401)
				.json({ 
					success: false, 
					message: "Token is invalid",
					error: error.message
				});
		}

		// If JWT is valid, move on to the next middleware or request handler
		next();
	} catch (error) {
		// If there is an error during the authentication process, return 401 Unauthorized response
		console.error("Auth middleware error:", error);
		return res.status(401).json({
			success: false,
			message: `Something Went Wrong While Validating the Token`,
			error: error.message
		});
	}
};

// Student Authorization
exports.isStudent = async (req, res, next) => {
	try {
		const userDetails = await User.findById(req.user.id);
		
		if(userDetails.accountType !== "Student") {
			return res.status(403).json({
				success: false,
				message: 'This is a Protected Route for Students only',
			});
		}
		next();
	}
	catch(error) {
		return res.status(500).json({
			success: false,
			message: 'User Role cannot be verified',
		});
	}
};

// Instructor Authorization
exports.isInstructor = async (req, res, next) => {
	try {
		const userDetails = await User.findById(req.user.id);
		
		if(userDetails.accountType !== "Instructor") {
			return res.status(403).json({
				success: false,
				message: 'This is a Protected Route for Instructors only',
			});
		}
		next();
	}
	catch(error) {
		return res.status(500).json({
			success: false,
			message: 'User Role cannot be verified',
		});
	}
};

// Admin Authorization
exports.isAdmin = async (req, res, next) => {
	try {
		const userDetails = await User.findById(req.user.id);
		
		if(userDetails.accountType !== "Admin") {
			return res.status(403).json({
				success: false,
				message: 'This is a Protected Route for Admin only',
			});
		}
		next();
	}
	catch(error) {
		return res.status(500).json({
			success: false,
			message: 'User Role cannot be verified',
		});
	}
};
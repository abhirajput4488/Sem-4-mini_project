const cloudinary = require("cloudinary").v2; //! Cloudinary is being required

exports.cloudinaryConnect = () => {
	try {
		// Check if required environment variables are set
		if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
			throw new Error("Missing required Cloudinary configuration. Please check your environment variables.");
		}

		// Configure Cloudinary
		cloudinary.config({
			//!    ########   Configuring the Cloudinary to Upload MEDIA ########
			cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
			api_key: process.env.CLOUDINARY_API_KEY,
			api_secret: process.env.CLOUDINARY_API_SECRET,
		});

		// Test the configuration
		console.log("Testing Cloudinary connection...");
		cloudinary.api.ping((error, result) => {
			if (error) {
				console.error("Cloudinary connection test failed:", error);
			} else {
				console.log("Cloudinary connection test successful:", result);
			}
		});

		console.log("Cloudinary configuration initialized successfully");
	} catch (error) {
		console.error("Error initializing Cloudinary:", error);
		throw error; // Re-throw to handle it in the server startup
	}
};
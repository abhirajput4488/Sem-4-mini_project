const cloudinary = require('cloudinary').v2
const fs = require('fs');
const path = require('path');

exports.uploadImageToCloudinary = async (file, folder, height, quality) => {
    try {
        // Validate file
        if (!file) {
            throw new Error("No file provided");
        }
        
        // Log file details
        console.log("File received for upload:", {
            name: file.name,
            size: file.size,
            mimetype: file.mimetype,
            tempFilePath: file.tempFilePath
        });

        // Validate tempFilePath
        if (!file.tempFilePath) {
            throw new Error("No temporary file path available");
        }

        // Check if file exists
        if (!fs.existsSync(file.tempFilePath)) {
            throw new Error(`File not found at path: ${file.tempFilePath}`);
        }

        // Set up options
        const options = {
            folder: folder || "temp",
            resource_type: "auto"
        };

        if (height) {
            options.height = height;
        }
        if (quality) {
            options.quality = quality;
        }

        console.log("Uploading to Cloudinary with options:", options);

        // Attempt upload
        const result = await cloudinary.uploader.upload(file.tempFilePath, options);
        
        if (!result || !result.secure_url) {
            throw new Error("Failed to get secure URL from Cloudinary");
        }

        console.log("Upload successful. Result:", {
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format
        });

        // Clean up temp file
        try {
            fs.unlinkSync(file.tempFilePath);
            console.log("Temporary file deleted:", file.tempFilePath);
        } catch (cleanupError) {
            console.warn("Failed to delete temporary file:", cleanupError.message);
        }

        return result;
    } catch (error) {
        console.error("Error in uploadImageToCloudinary:", error);
        if (error.http_code) {
            console.error("Cloudinary HTTP error code:", error.http_code);
        }
        throw error;
    }
}
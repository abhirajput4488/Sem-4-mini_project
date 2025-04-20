const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

const OTPSchema = new mongoose.Schema({
	email: {
		type: String,
		required: [true, "Email is required"],
		validate: {
			validator: function(v) {
				return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
			},
			message: props => `${props.value} is not a valid email address!`
		}
	},
	otp: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
		expires: 60 * 5, // The document will be automatically deleted after 5 minutes of its creation time
	},
});

// Define a function to send emails
async function sendVerificationEmail(email, otp) {
	if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		console.error("Invalid email address:", email);
		throw new Error("Invalid email address");
	}
	
	try {
		const mailResponse = await mailSender(
			email,
			"Verification Email",
			emailTemplate(otp)
		);
		console.log("Email sent successfully: ", mailResponse);
	} catch (error) {
		console.log("Error occurred while sending email: ", error);
		throw error;
	}
}

// Define a post-save hook to send email after the document has been saved
OTPSchema.pre("save", async function (next) {
	console.log("New document saved to database");

	// Only send an email when a new document is created
	if (this.isNew) {
		try {
			await sendVerificationEmail(this.email, this.otp);
			next();
		} catch (error) {
			next(error);
		}
	} else {
		next();
	}
});

const OTP = mongoose.model("OTP", OTPSchema);

module.exports = OTP;
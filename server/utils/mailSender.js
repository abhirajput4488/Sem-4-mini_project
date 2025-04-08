const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        console.error("Invalid email address:", email);
        throw new Error("Invalid email address");
    }

    try {
        let transporter = nodemailer.createTransport({
            service: process.env.MAIL_SERVICE || 'gmail',
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT || 587,
            secure: false,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        });

        let info = await transporter.sendMail({
            from: process.env.MAIL_FROM || 'EduNexus Team',
            to: email,
            subject: title,
            html: body,
        });
        
        console.log("Email sent successfully");
        return info;
    }
    catch(error) {
        console.log("Error in mailSender: ", error.message);
        throw error; // Properly throw the error instead of just logging it
    }
}

module.exports = mailSender;
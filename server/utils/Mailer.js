import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create a transporter
const transporter = nodemailer.createTransport({
  //   service: process.env.MAIL_SERVICE, // Use Gmail as the service
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_ADDRESS, // Your email
    pass: process.env.EMAIL_PASSWORD, // Your email password or app-specific password if 2FA is enabled
  },
});

// Function to send email
const mail = async (to, otpCode) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_ADDRESS, // Sender address
      to: to, // List of recipients
      subject: "Password Reset Request - Your OTP Code",
      html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <p>Hi,</p>
        <p>We received a request to reset the password for your account. To proceed with your password reset, please use the One-Time Password (OTP) provided below. This code is valid for 10 minutes.</p>
        <h2 style="color: #4CAF50; text-align: center;">${otpCode}</h2>
        <p>If you did not request a password reset, please ignore this email or contact our support team immediately for assistance.</p>
        <br>
        <p>Thank you,</p>
        <p>The [Your Company Name] Team</p>
        <p><small>Note: For security purposes, do not share this code with anyone.</small></p>
      </div>
    `,
    };

    // Send mail
    const info = await transporter.sendMail(mailOptions);
    // console.log("Email sent:", info.response);
  } catch (error) {
    // console.error("Error sending email:", error);
    throw new Error(error.message);
  }
};

export default mail;

// Example usage
// sendMail(
//   "recipient@example.com",
//   "Test Email Subject",
//   "This is a test email.",
//   "<p>This is a <strong>test</strong> email.</p>"
// );

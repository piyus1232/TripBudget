import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();

const sendEmail = async ({ email, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,          // ✅ was HOST
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true',  // ✅ proper boolean check
      auth: {
        user: process.env.EMAIL_USER,        // ✅ was USER (reserved by Node.js!)
        pass: process.env.EMAIL_PASS,        // ✅ was PASS
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,          // ✅ same fix
      to: email,
      subject: subject,
      html: html,
    });

    console.log("Email sent successfully");
  } catch (error) {
    console.log("Email error:", error);
  }
};

export { sendEmail };

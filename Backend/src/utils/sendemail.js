import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();


 const sendEmail = async ({ to, subject, html }) => {
  try {
    // Create a transporter object using your email service
    const transporter = nodemailer.createTransport({
      service: 'gmail', // e.g., Gmail, Outlook, Yahoo — or use 'host', 'port' instead
      auth: {
        user: process.env.SMTP_EMAIL, // your email
        pass: process.env.SMTP_PASSWORD, // your email password or app password
      },
    });

    // Send mail with the defined options
    const mailOptions = {
      from: `"Assignic" <${process.env.SMTP_EMAIL}>`, // sender
      to, // recipient
      subject,
      html, // HTML content
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
export {sendEmail}
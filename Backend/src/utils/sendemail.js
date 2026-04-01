import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();

const sendEmail = async ({ email, subject, html }) => {
  const host = process.env.EMAIL_HOST || process.env.HOST;
  const port = Number(process.env.EMAIL_PORT || 587);
  const secureRaw = process.env.EMAIL_SECURE ?? process.env.SECURE ?? "false";
  const user = process.env.EMAIL_USER || process.env.USER;
  const pass = process.env.EMAIL_PASS || process.env.PASS;
  const secure = String(secureRaw).toLowerCase() === "true";

  if (!host || !user || !pass) {
    throw new Error("Missing SMTP config. Set EMAIL_HOST/EMAIL_USER/EMAIL_PASS in Backend/.env");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: user,
    to: email,
    subject,
    html,
  });

  console.log(`Email sent successfully via ${host}:${port} secure=${secure}`);
};

export { sendEmail };

// routes/verifyEmail.js
import express from "express";
import crypto from "crypto";
import nodemailer from "nodemailer";
import Token from "../models/token.js"; // Fixed capitalisation to match model name
import { verifyJWT } from "../middleware/auth.middleware.js"; // Import your JWT middleware
import { User } from "../models/user.model.js";
const verifyrouter= express.Router();

// Send Verification Email
verifyrouter.post("/send-verification", verifyJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user._id); // comes from verifyJWT middleware

    if (!user) return res.status(400).send("User not found");
    if (user.verified) return res.status(400).send("Email already verified");

    // Generate token
    const tokenValue = crypto.randomBytes(32).toString("hex");

    // Remove old token & save new one
    await Token.findOneAndDelete({ userId: user._id });
    await new Token({ userId: user._id, token: tokenValue }).save();

    // Create verification link
    const link = `http://localhost:5000/api/verify/${tokenValue}`;

    // Send email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    await transporter.sendMail({
      to: user.email,
      subject: "Email Verification",
      html: `<h2>Verify Your Email</h2>
             <p>Click <a href="${link}">here</a> to verify your email.</p>`
    });

    res.status(200).send("Verification email sent");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Verify Token
verifyrouter.get("/:token", async (req, res) => {
  try {
    const tokenDoc = await Token.findOne({ token: req.params.token });
    if (!tokenDoc) return res.status(400).send("Invalid or expired token");

    await User.findByIdAndUpdate(tokenDoc.userId, { verified: true });
    await Token.deleteOne({ _id: tokenDoc._id });
    res.redirect('http://localhost:5173/account?verified=true'); 

    // res.send("Email verified successfully");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export default verifyrouter;

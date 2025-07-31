import { form } from "../models/form.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const userform = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    throw new ApiError(400, "All fields are required to submit");
  }

  const user = await form.create({ name, email, subject, message });

  res.status(201).json({
    success: true,
    message: "Form submitted successfully",
    user,
  });
});

export default userform;

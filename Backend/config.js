import dotenv from "dotenv";

dotenv.config({
  path: "/home/ubuntu/TripBudget/Backend/.env"
});

console.log("ENV LOADED:", process.env.CLOUDINARY_API_KEY);

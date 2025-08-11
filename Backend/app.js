import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userrouter from "./src/routes/user.routes.js"
<<<<<<< HEAD
import hotelrouter from './src/routes/hotel.images.js';
const app = express();
app.use(cors({
  origin: process.env.CORS_ORIGIN , 
=======
const app = express();
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000', 
>>>>>>> e4db1e0 (Initial commit)
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Register routes
app.use('/api/v1/users', userrouter);
<<<<<<< HEAD
app.use('/api', hotelrouter);

=======
>>>>>>> e4db1e0 (Initial commit)

export { app };
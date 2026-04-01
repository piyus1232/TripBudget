import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userrouter from "./src/routes/user.routes.js"
import hotelrouter from './src/routes/hotel.images.js';
import transportrouter from './src/routes/transport.routes.js';
// import verifyrouter from './src/routes/verifyemail.js';

const app = express();
const corsEnv = process.env.CORS_ORIGIN?.trim();
const defaultOrigins = ['http://localhost:5173', 'https://tripbudget.in'];
const allowedOrigins = corsEnv
  ? corsEnv.split(',').map((o) => o.trim()).filter(Boolean)
  : defaultOrigins;

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Register routes
app.use('/api/v1/users', userrouter);
// app.use('/api/verify', verifyrouter);

app.use('/api', hotelrouter);
app.use('/api/v2', transportrouter);
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



app.use(express.static(path.join(__dirname, "../Frontend/TripBudget/dist")));

app.use((req, res) => {
  res.sendFile(
    path.join(__dirname, "../Frontend/TripBudget/dist/index.html")
  );
});
export { app };

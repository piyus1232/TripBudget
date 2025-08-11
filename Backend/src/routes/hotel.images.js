import express from 'express'
import axios from 'axios'
import {Router } from "express";
// import { verifyJWT } from '../middleware/auth.middleware.js';
const hotelrouter = Router();
import { hotelimgcontroller, placecontroller } from '../controllers/hotelimgcontroller.js';

 // Store securely

hotelrouter.post('/hotel-image', hotelimgcontroller);
hotelrouter.post('/place-image', placecontroller);

export default hotelrouter

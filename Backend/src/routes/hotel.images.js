import express from 'express'
import axios from 'axios'
import {Router } from "express";
// import { verifyJWT } from '../middleware/auth.middleware.js';
const hotelrouter = Router();
import { foodcontroller, hotelimgcontroller, placecontroller } from '../controllers/hotelimgcontroller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

 // Store securely

hotelrouter.post('/hotel-image',verifyJWT, hotelimgcontroller);
hotelrouter.post('/place-image', verifyJWT,placecontroller);
hotelrouter.post('/foodimage', verifyJWT,foodcontroller);

export default hotelrouter

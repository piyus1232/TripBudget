import express from 'express'
import axios from 'axios'
import {Router } from "express";
const hotelrouter = Router();
import { hotelimgcontroller } from '../controllers/hotelimgcontroller.js';

 // Store securely

hotelrouter.post('/hotel-image', hotelimgcontroller);

export default hotelrouter

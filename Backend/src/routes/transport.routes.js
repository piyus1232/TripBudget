import express from 'express'
import axios from 'axios'
import { getTransitRoute } from '../controllers/transport.controller.js';
import {Router } from "express";
// import { verifyJWT } from '../middleware/auth.middleware.js';
const transportrouter = Router();


 // Store securely


transportrouter.post('/transport', getTransitRoute);

export default transportrouter

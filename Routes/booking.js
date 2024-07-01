import express from "express";
import { authenticate } from "./../auth/verifyToken.js";
import {
  getCheckoutSession,
  deleteBooking,
} from "../Controllers/bookingController.js";

const router = express.Router();
router.use(authenticate);

router.post("/checkout-session/:doctorId", getCheckoutSession);
router.delete("/bookings/:id", deleteBooking);

export default router;

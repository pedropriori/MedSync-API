import express from "express";
import {
  updateDoctor,
  deleteDoctor,
  getAllDoctor,
  getSingleDoctor,
  getDoctorProfile,
  addAvailableTimeSlot,
  getAvailableTimeSlots,
  saveAvailableTimeSlots,
} from "../Controllers/doctorController.js";
import { authenticate, restrict } from "../auth/verifyToken.js";
import reviewRoute from "./review.js";

const router = express.Router();

// nested route
router.use("/:doctorId/reviews", reviewRoute);

router.get("/:id", getSingleDoctor);
router.get("/", getAllDoctor);
router.put("/:id", authenticate, restrict(["doctor"]), updateDoctor);
router.delete("/:id", authenticate, restrict(["doctor"]), deleteDoctor);
router.get("/profile/me", authenticate, restrict(["doctor"]), getDoctorProfile);
router.post("/availability", addAvailableTimeSlot);

router.get('/:id/availableTimeSlots', getAvailableTimeSlots);
router.post('/me/availableTimeSlots', authenticate, saveAvailableTimeSlots);

export default router;

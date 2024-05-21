import express from "express";
import { getMyAppointments } from "../Controllers/appointmentController.js";
import { restrict, authenticate } from "../auth/verifyToken.js";

const router = express.Router();

// Rota para obter os agendamentos do usuário logado
router.get("/my-appointments", authenticate, restrict(['patient']), getMyAppointments);

export default router;
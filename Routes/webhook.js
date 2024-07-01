import express from "express";
import Booking from "../models/BookingSchema.js";
import Doctor from "../models/DoctorSchema.js";
import User from "../models/UserSchema.js";
import Stripe from "stripe";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/webhook", express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const doctorId = session.client_reference_id;
    const userEmail = session.customer_email;

    const doctor = await Doctor.findById(doctorId);
    const user = await User.findOne({ email: userEmail });

    if (!doctor || !user) {
      console.error("Doctor or User not found");
      return res.status(400).json({ success: false, message: "Doctor or User not found" });
    }

    const booking = new Booking({
      doctor: doctor._id,
      user: user._id,
      ticketPrice: doctor.ticketPrice,
      session: session.id,
      date: session.metadata.date,
      time: session.metadata.time,
      isTelemedicine: session.metadata.isTelemedicine,
    });

    await booking.save();

    const availableSlotIndex = doctor.availableTimeSlots.findIndex(
      (slot) =>
        slot.date.toISOString().split("T")[0] === new Date(session.metadata.date).toISOString().split("T")[0]
    );

    if (availableSlotIndex !== -1) {
      doctor.availableTimeSlots[availableSlotIndex].timeSlots = doctor.availableTimeSlots[
        availableSlotIndex
      ].timeSlots.filter((slotTime) => slotTime !== session.metadata.time);
    }

    await doctor.save();

    res.status(200).json({ success: true, message: "Booking saved successfully" });
  } else {
    res.status(400).json({ success: false, message: "Unhandled event type" });
  }
});

export default router;
import express from 'express';
import Stripe from 'stripe';
import Booking from '../models/BookingSchema.js';
import Doctor from '../models/DoctorSchema.js';
import User from '../models/UserSchema.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log(`⚠️  Webhook signature verification failed: ${err.message}`);
    return res.sendStatus(400);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId, doctorId, date, time } = session.metadata;

    const booking = new Booking({
      doctor: doctorId,
      user: userId,
      ticketPrice: session.amount_total / 100,
      session: session.id,
      date,
      time,
    });

    await booking.save();

    // Update user and doctor with the new booking
    await User.findByIdAndUpdate(userId, { $push: { appointments: booking._id } });
    await Doctor.findByIdAndUpdate(doctorId, { $push: { appointments: booking._id } });

    console.log(`Booking created for session ${session.id}`);
  }

  res.status(200).json({ received: true });
});

export default router;
import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";
import Booking from "../models/BookingSchema.js";
import Stripe from "stripe";
import { createZoomMeeting } from '../services/zoomService.js';
import dotenv from 'dotenv';

dotenv.config();

export const getCheckoutSession = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.doctorId);
    const user = await User.findById(req.userId);

    const { date, time, isTelemedicine } = req.body;

    if (isTelemedicine && !doctor.isAvailableForTelemedicine) {
      return res.status(400).json({
        success: false,
        message: "Doctor does not allow telemedicine appointments",
      });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.CLIENT_SITE_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_SITE_URL}/checkout-cancelled`,
      customer_email: user.email,
      client_reference_id: req.params.doctorId,
      line_items: [
        {
          price_data: {
            currency: "brl",
            unit_amount: doctor.ticketPrice * 100,
            product_data: {
              name: doctor.name,
              description: doctor.bio,
              images: [doctor.photo],
            },
          },
          quantity: 1,
        },
      ],
    });

    let meetingLink = null;
    let startMeetingLink = null;
    if (isTelemedicine) {
      const meeting = await createZoomMeeting({
        topic: `Consulta com ${doctor.name}`,
        start_time: `${date}T${time}:00`,
        duration: 40,
      });

      meetingLink = meeting.join_url;
      startMeetingLink = meeting.start_url;
    }

    const booking = new Booking({
      doctor: doctor._id,
      user: user._id,
      ticketPrice: doctor.ticketPrice,
      session: session.id,
      date,
      time,
      isTelemedicine,
      meetingLink: meetingLink,
      startMeetingLink: startMeetingLink
    });

    await booking.save();

    const availableSlotIndex = doctor.availableTimeSlots.findIndex(
      (slot) =>
        slot.date.toISOString().split("T")[0] === new Date(date).toISOString().split("T")[0]
    );

    if (availableSlotIndex !== -1) {
      doctor.availableTimeSlots[availableSlotIndex].timeSlots = doctor.availableTimeSlots[
        availableSlotIndex
      ].timeSlots.filter((slotTime) => slotTime !== time);
    }

    await doctor.save();

    res.status(200).json({ success: true, url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error creating checkout session" });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findByIdAndDelete(bookingId);

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    await User.findByIdAndUpdate(booking.user, {
      $pull: { appointments: bookingId },
    });
    await Doctor.findByIdAndUpdate(booking.doctor, {
      $pull: { appointments: bookingId },
    });

    res
      .status(200)
      .json({ success: true, message: "Booking cancelled successfully" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Error cancelling booking" });
  }
};

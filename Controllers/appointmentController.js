import Booking from "../models/BookingSchema.js";

export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Booking.find({ user: req.user._id });
    res.status(200).json({
      status: "success",
      data: appointments,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

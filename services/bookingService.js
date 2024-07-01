import Booking from "../models/BookingSchema.js";
import Doctor from "../models/DoctorSchema.js";

export async function createBooking(userId, doctorId, date, time) {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new Error("Doctor not found");

  const isTimeSlotAvailable = doctor.availableTimeSlots.some(
    (slot) =>
      slot.date.toISOString() === new Date(date).toISOString() &&
      slot.timeSlots.includes(time)
  );

  if (!isTimeSlotAvailable) throw new Error("Time slot not available");

  const booking = new Booking({
    user: userId,
    doctor: doctorId,
    date,
    time,
    ticketPrice: doctor.ticketPrice,
    isTelemedicine: doctor.isAvailableForTelemedicine,
  });
  await booking.save();

  // Remove the booked time slot
  doctor.availableTimeSlots = doctor.availableTimeSlots.map((slot) => {
    if (slot.date.toISOString() === new Date(date).toISOString()) {
      slot.timeSlots = slot.timeSlots.filter((ts) => ts !== time);
    }
    return slot;
  });

  await doctor.save();
  return booking;
}

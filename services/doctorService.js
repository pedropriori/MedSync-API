import Doctor from "../models/DoctorSchema.js";

export async function addAvailableTimeSlot(doctorId, date, timeSlots) {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new Error("Doctor not found");

  doctor.availableTimeSlots.push({ date, timeSlots });
  await doctor.save();
  return doctor;
}

export async function getAvailableTimeSlots(doctorId) {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new Error("Doctor not found");
  return doctor.availableTimeSlots;
}

import mongoose from "mongoose";

const AvailableTimeSlotSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  timeSlots: [String],
});

const DoctorSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: Number },
  photo: { type: String },
  ticketPrice: { type: Number },
  isAvailableForTelemedicine: { type: Boolean, default: false },
  address: {
    cep: { type: String, required: true },
    logradouro: { type: String, required: true },
    numero: { type: String, required: true },
    complemento: { type: String },
    bairro: { type: String, required: true },
    cidade: { type: String, required: true },
    estado: { type: String, required: true },
  },
  role: {
    type: String,
  },
  specialization: { type: String },
  qualifications: {
    type: Array,
  },
  experiences: {
    type: Array,
  },
  weekDayTimeSlots: { type: Array },
  bio: { type: String },
  about: { type: String },
  availableTimeSlots: [AvailableTimeSlotSchema],
  reviews: [{ type: mongoose.Types.ObjectId, ref: "Review" }],
  averageRating: {
    type: Number,
    default: 0,
  },
  totalRating: {
    type: Number,
    default: 0,
  },
  isApproved: {
    type: String,
    enum: ["pending", "approved", "cancelled"],
    default: "pending",
  },
  appointments: [{ type: mongoose.Types.ObjectId, ref: "Appointment" }],
});

export default mongoose.model("Doctor", DoctorSchema);

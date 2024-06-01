import mongoose from "mongoose";
import User from "./UserSchema.js";
import Doctor from "./DoctorSchema.js";

const bookingSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ticketPrice: { type: String, required: true },
    // appointmentDate: {
    //   type: Date,
    //   required: true,
    // },
    status: {
      type: String,
      enum: ["pending", "approved", "cancelled"],
      default: "pending",
    },
    isPaid: {
      type: Boolean,
      default: true,
    },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    isTelemedicine: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// bookingSchema.pre(/^find/, function (next) {
//   this.populate('user').populate({
//     path: 'doctor',
//     select: 'name'
//   })

//   next()
// })

bookingSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo email gender'
  }).populate({
    path: 'doctor',
    select: 'name photo specialization address'
  });

  next();
});

bookingSchema.post('save', async function (doc, next) {
  try {
    await User.findByIdAndUpdate(doc.user, { $push: { appointments: doc._id } });
    await Doctor.findByIdAndUpdate(doc.doctor, { $push: { appointments: doc._id } });
    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model("Booking", bookingSchema);

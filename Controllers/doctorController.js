import BookingSchema from "../models/BookingSchema.js";
import Doctor from "../models/DoctorSchema.js";
import * as professionalService from "../services/doctorService.js";

export const updateDoctor = async (req, res) => {
  const id = req.params.id;

  try {
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );

    if (!updatedDoctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    res.status(200).json({
      success: true,
      message: "Successfully updated",
      data: updatedDoctor,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to updated" });
  }
};

export const deleteDoctor = async (req, res) => {
  const id = req.params.id;

  try {
    await Doctor.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Successfully deleted",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete" });
  }
};

export const getSingleDoctor = async (req, res) => {
  const id = req.params.id;

  try {
    const doctor = await Doctor.findById(id)
      .populate("reviews")
      .select("-password");

    res.status(200).json({
      success: true,
      message: "Doctor found",
      data: doctor,
    });
  } catch (err) { }
};

export const getAllDoctor = async (req, res) => {
  try {
    const { query } = req.query;
    let searchCriteria = { isApproved: "approved" };

    if (query) {
      const queryParts = query.split(',').map(part => part.trim());

      searchCriteria.$or = queryParts.map(part => {
        return {
          $or: [
            { name: { $regex: part, $options: "i" } },
            { specialization: { $regex: part, $options: "i" } },
            { "address.cidade": { $regex: part, $options: "i" } },
            { "address.estado": { $regex: part, $options: "i" } }
          ]
        };
      });
    }

    const doctors = await Doctor.find(searchCriteria).select("-password");

    res.status(200).json({
      success: true,
      message: "Doctors found",
      data: doctors,
    });
  } catch (err) {
    res.status(404).json({ success: false, message: "Not found" });
  }
};

export const getDoctorProfile = async (req, res) => {
  const doctorId = req.userId;

  try {
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    const { password, ...rest } = doctor._doc;
    const appointments = await BookingSchema.find({ doctor: doctorId });

    res.status(200).json({
      success: true,
      message: "Profile info is getting",
      data: { ...rest, appointments },
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Something went wrong, cannot get" });
  }
};

export async function addAvailableTimeSlot(req, res) {
  const { doctorId, date, timeSlots } = req.body;

  try {
    const doctor = await professionalService.addAvailableTimeSlot(
      doctorId,
      date,
      timeSlots
    );
    res.status(200).json(doctor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export const getAvailableTimeSlots = async (req, res) => {
  const { date } = req.query;
  const doctorId = req.params.id;

  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const dateString = new Date(date).toISOString().split('T')[0]; // Convert to YYYY-MM-DD format
    const availableTimeSlots = doctor.availableTimeSlots.find(slot =>
      slot.date.toISOString().split('T')[0] === dateString
    );

    res.status(200).json({ timeSlots: availableTimeSlots ? availableTimeSlots.timeSlots : [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const saveAvailableTimeSlots = async (req, res) => {
  const { date, timeSlots } = req.body;
  const doctorId = req.userId;
  
  try {
    console.log(`Saving time slots for doctor: ${doctorId}, Date: ${date}, TimeSlots: ${timeSlots}`); // Log para depuração
    
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Remove time slots for past dates
    const today = new Date();
    doctor.availableTimeSlots = doctor.availableTimeSlots.filter(slot => new Date(slot.date) >= today);
    
    // Find index of the date if it already exists
    const existingSlotIndex = doctor.availableTimeSlots.findIndex(slot =>
      slot.date.toISOString().split('T')[0] === new Date(date).toISOString().split('T')[0]
    );
    
    if (existingSlotIndex !== -1) {
      // Overwrite existing time slots for the date
      doctor.availableTimeSlots[existingSlotIndex].timeSlots = [...new Set(timeSlots)];
    } else {
      // Add new time slots for the date
      doctor.availableTimeSlots.push({ date: new Date(date), timeSlots });
    }
    
    // Remove any time slots with an empty array
    doctor.availableTimeSlots = doctor.availableTimeSlots.filter(slot => slot.timeSlots.length > 0);
    
    await doctor.save();
    
    res.status(200).json({ timeSlots });
  } catch (error) {
    console.error('Erro ao salvar horários:', error);
    res.status(500).json({ message: error.message });
  }
};


// export const saveAvailableTimeSlots = async (req, res) => {
//   const { date, timeSlots } = req.body;
//   const doctorId = req.userId;

//   try {
//     console.log(`Saving time slots for doctor: ${doctorId}, Date: ${date}, TimeSlots: ${timeSlots}`);

//     const doctor = await Doctor.findById(doctorId);
//     if (!doctor) {
//       return res.status(404).json({ message: 'Doctor not found' });
//     }

//     const existingSlotIndex = doctor.availableTimeSlots.findIndex(slot =>
//       slot.date.toISOString() === new Date(date).toISOString()
//     );

//     if (existingSlotIndex !== -1) {
//       doctor.availableTimeSlots[existingSlotIndex].timeSlots = [
//         ...new Set([...doctor.availableTimeSlots[existingSlotIndex].timeSlots, ...timeSlots])
//       ];
//     } else {
//       doctor.availableTimeSlots.push({ date: new Date(date), timeSlots });
//     }

//     await doctor.save();

//     res.status(200).json({ timeSlots });
//   } catch (error) {
//     console.error('Erro ao salvar horários:', error);
//     res.status(500).json({ message: error.message });
//   }
// };
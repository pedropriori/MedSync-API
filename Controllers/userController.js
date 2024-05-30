import User from "../models/UserSchema.js";
import Booking from "../models/BookingSchema.js"
import Doctor from "../models/DoctorSchema.js"
import bcrypt from 'bcryptjs'

export const updateUser = async (req, res) => {
  const id = req.params.id

  try {
    if (req.body.password) {

      const salt = await bcrypt.genSalt(10)

      req.body.password = await bcrypt.hash(req.body.password, salt)
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    )

    res
      .status(200)
      .json({
        success: true,
        message: 'Successfully updated',
        data: updatedUser
      })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to updated' })
  }
}

export const deleteUser = async (req, res) => {
  const id = req.params.id

  try {
    await User.findByIdAndDelete(
      id,
    )

    res
      .status(200)
      .json({
        success: true,
        message: 'Successfully deleted',
      })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete' })
  }
}

export const getSingleUser = async (req, res) => {
  const id = req.params.id;

  try {
    const user = await User.findById(id).select('-password')

    res.status(200).json({
      success: true,
      message: 'User found',
      data: user,
    })
  } catch (err) {

  }
}

export const getAllUser = async (req, res) => {

  try {
    const users = await User.find({}).select('-password')

    res
      .status(200)
      .json({
        success: true,
        message: 'Users found',
        data: users
      })
  } catch (err) {
    res.status(404).json({ success: false, message: 'Not found' })
  }
}

export const getUserProfile = async (req, res) => {
  const userId = req.userId

  try {
    const user = await User.findById(userId)

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' })
    }

    const { password, ...rest } = user._doc

    res
      .status(200)
      .json({ success: true, message: 'Profile info is getting', data: { ...rest } })
  } catch (err) {
    res.status(500)
      .json({
        success: false,
        message: 'Something went wrong, cannot get'
      })
  }
}

export const getMyAppointments = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.userId })
      .populate({
        path: 'doctor',
        select: 'name photo specialization address',
      })
      .select('doctor ticketPrice date time status isPaid');

    if (!bookings || bookings.length === 0) {
      throw new Error('No bookings found for this user');
    }

    res.status(200).json({
      success: true,
      message: 'Appointments retrieved successfully',
      data: bookings
    });
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({
      success: false,
      message: 'Something went wrong, cannot get appointments',
      error: err.message,
    });
  }
};
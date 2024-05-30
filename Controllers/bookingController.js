import User from '../models/UserSchema.js'
import Doctor from '../models/DoctorSchema.js'
import Booking from '../models/BookingSchema.js'
import Stripe from 'stripe'

export const getCheckoutSession = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.doctorId)
    const user = await User.findById(req.userId)

    const { date, time } = req.body

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${process.env.CLIENT_SITE_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_SITE_URL}/checkout-cancelled`,
      customer_email: user.email,
      client_reference_id: req.params.doctorId,
      line_items: [
        {
          price_data: {
            currency: 'brl',
            unit_amount: doctor.ticketPrice * 100,
            product_data: {
              name: doctor.name,
              description: doctor.bio,
              images: [doctor.photo]
            }
          },
          quantity: 1
        }
      ]
    })

    const booking = new Booking({
      doctor: doctor._id,
      user: user._id,
      ticketPrice: doctor.ticketPrice,
      session: session.id,
      date,
      time,
    })

    await booking.save()

    res.status(200).json({ success: true, message: 'Successfully paid', session })

  } catch (err) {
    console.log(err)
    res.status(500).json({ success: false, message: 'Error creating checkout session' })
  }
}

// USAR QUANDO ESTIVER EM PRODUÇÃO

// export const getCheckoutSession = async (req, res) => {
//   try {
//     const doctor = await Doctor.findById(req.params.doctorId);
//     const user = await User.findById(req.userId);

//     const { date, time } = req.body;

//     const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       mode: 'payment',
//       success_url: `${process.env.CLIENT_SITE_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.CLIENT_SITE_URL}/checkout-cancelled`,
//       customer_email: user.email,
//       client_reference_id: req.params.doctorId,
//       metadata: {
//         userId: user._id.toString(),
//         doctorId: doctor._id.toString(),
//         date,
//         time,
//       },
//       line_items: [
//         {
//           price_data: {
//             currency: 'brl',
//             unit_amount: doctor.ticketPrice * 100,
//             product_data: {
//               name: doctor.name,
//               description: doctor.bio,
//               images: [doctor.photo],
//             },
//           },
//           quantity: 1,
//         },
//       ],
//     });

//     res.status(200).json({ success: true, message: 'Successfully created checkout session', session });

//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ success: false, message: 'Error creating checkout session' });
//   }
// };

export const deleteBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findByIdAndDelete(bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    await User.findByIdAndUpdate(booking.user, { $pull: { appointments: bookingId } });
    await Doctor.findByIdAndUpdate(booking.doctor, { $pull: { appointments: bookingId } });

    res.status(200).json({ success: true, message: 'Booking cancelled successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error cancelling booking' });
  }
};
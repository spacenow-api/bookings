const { success, failure } = require('../libs/response-lib');
const { BookingStates } = require('./../validations');
const { Bookings } = require('./../models');

module.exports.main = async (event, context, callback) => {
  try {
    await Bookings.update(
      { bookingState: BookingStates.CANCELLED, updatedAt: Date.now() },
      { where: { bookingId: event.pathParameters.id } }
    );
    return success({ status: true });
  } catch (err) {
    console.error(err);
    return failure({ status: false });
  }
};

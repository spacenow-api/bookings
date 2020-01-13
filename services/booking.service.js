const { log } = require('./../helpers/log.utils')
const { onSendEmail } = require('./../helpers/email.function')
const { onCleanAvailabilities } = require('./../helpers/availabilities.function')
const updateBookingState = require('./../helpers/updateBookingState')

const { BookingStates, resolveBooking } = require('./../validations')

const voucherService = require('./voucher.service')

const { Bookings, User } = require('./../models')

async function doRequestedBooking(bookingId) {
  try {
    const bookingObjUpdated = await updateBookingState(bookingId, BookingStates.REQUESTED)
    log(bookingId, 'State updated to Requested.')
    await onSendEmail(`api-emails-${process.env.environment}-sendEmailByBookingRequestHost`, bookingId)
    await onSendEmail(`api-emails-${process.env.environment}-sendEmailByBookingRequestGuest`, bookingId)
    return bookingObjUpdated
  } catch (err) {
    console.error(`Problems to update booking ${bookingId} to requested:`, err)
    throw err
  }
}

async function doApproveBooking(bookingId) {
  try {
    const bookingObj = await Bookings.findOne({ where: { bookingId }, raw: true })
    if (BookingStates.REQUESTED === bookingObj.bookingState || BookingStates.PENDING === bookingObj.bookingState) {
      let bookingObjUpdated = await updateBookingState(bookingId, BookingStates.APPROVED)
      log(bookingId, 'State updated to Approved.')
      // Validating Host Voucher...
      bookingObjUpdated = await onValidateVoucher(bookingObjUpdated)
      if ('request' === bookingObj.bookingType) {
        // It's not necessary to send email inviting to pay if booking is instant...
        await onSendEmail(`api-emails-${process.env.environment}-sendEmailByBookingReadyToPay`, bookingId)
      }
      return bookingObjUpdated
    } else {
      console.warn(`Booking ${bookingId} is not Requested.`)
      return resolveBooking(bookingObj)
    }
  } catch (err) {
    console.error(`Problems to update booking ${bookingId} to Approved:`, err)
    throw err
  }
}

async function onValidateVoucher(bookingObject) {
  try {
    const { hostId, bookingId } = bookingObject
    const { voucherCode, email } = await User.findOne({ where: { id: hostId } })
    if (voucherCode) {
      const { status } = await voucherService.validate(voucherCode)
      if (status === 'VALID') {
        try {
          const bookingUpdated = voucherService.insertVoucher(voucherCode, bookingId)
          log(bookingId, `Voucher ${voucherCode} applied by Host ${hostId}.`)
          return bookingUpdated
        } catch (err) {
          console.error(`Error trying to use a host voucher:`, err)
        }
      } else {
        console.warn(`The voucher ${voucherCode} of host ${email} is not valid any more.`)
      }
    }
    return bookingObject
  } catch (err) {
    throw err
  }
}

async function doDeclineBooking(bookingId) {
  try {
    const bookingObj = await Bookings.findOne({ where: { bookingId } })
    if (BookingStates.REQUESTED === bookingObj.bookingState) {
      const bookingObjUpdated = await updateBookingState(bookingId, BookingStates.DECLINED)
      log(bookingId, 'State updated to Declined.')
      await onCleanAvailabilities(bookingId)
      log(bookingId, 'Availabilities cleaned.')
      await onSendEmail(`api-emails-${process.env.environment}-sendEmailByBookingDeclined`, bookingId)
      return bookingObjUpdated
    } else {
      console.warn(`Booking ${bookingId} is not Requested.`)
      return resolveBooking(bookingObj)
    }
  } catch (err) {
    console.error(`Problems to decline booking ${bookingId}:`, err)
    throw err
  }
}

async function doPaymentConfirmation(bookingId, sourceId, chargeId) {
  try {
    const bookingObj = await Bookings.findOne({ where: { bookingId } })
    if (BookingStates.APPROVED === bookingObj.bookingState) {
      await Bookings.update({
        sourceId: sourceId,
        chargeId: chargeId,
        paymentState: 'completed',
        updatedAt: Date.now()
      }, { where: { bookingId } })
      log(bookingId, 'State updated to Completed.')
      await onSendEmail(`api-emails-${process.env.environment}-sendEmailByBookingInstantHost`, bookingId)
      await onSendEmail(`api-emails-${process.env.environment}-sendEmailByBookingInstantGuest`, bookingId)
      const bookingObjUpdated = await Bookings.findOne({ where: { bookingId }, raw: true })
      return resolveBooking(bookingObjUpdated)
    } else {
      console.warn(`Booking ${bookingId} is not Approved.`)
      return resolveBooking(bookingObj)
    }
  } catch (err) {
    console.error(`Problems to decline booking ${bookingId}:`, err)
    throw err
  }
}

module.exports = {
  doRequestedBooking,
  doApproveBooking,
  doDeclineBooking,
  doPaymentConfirmation
}
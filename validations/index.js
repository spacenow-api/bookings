const moment = require('moment')

/**
 * Possible Spacenow bookings States;
 */
const BookingStates = {
  PENDING: 'pending',
  CANCELLED: 'cancelled',
  TIMEOUT: 'timeout',
  REQUESTED: 'requested',
  APPROVED: 'approved',
  DECLINED: 'declined',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
  ACCEPTED: 'accepted'
}
const BookingStatesArray = Object.values(BookingStates)

/**
 * @deprecated Need to refactory and use a similar approach as 'getCalcTotalValue'
 */
const calcTotal = (basePrice, quantity = 1, period, guestFee) => {
  let total = basePrice * quantity * period
  total += total * guestFee
  return total
}

const getEndDate = (startDate, period, priceType) => {
  var eDate
  switch (priceType) {
    case 'daily':
      eDate = moment(startDate).add(period, 'days')
      break
    case 'weekly':
      eDate = moment(startDate).add(period, 'weeks')
      break
    case 'monthly':
      eDate = moment(startDate).add(period, 'months')
      break
  }
  return eDate
}

const getDates = (startDate, endDate) => {
  var arrDates = []
  var sDate = moment(startDate)
  var eDate = moment(endDate)
  while (sDate < eDate) {
    arrDates.push(sDate.toISOString())
    sDate = sDate.clone().add(1, 'd')
  }
  return arrDates
}

const resolveBooking = (booking) => {
  const reservationsString = booking.reservations
  booking.reservations = []
  if (reservationsString) {
    booking.reservations = reservationsString.split(',')
  }
  return booking
}

const hasBlockAvailabilities = (bookings, reservationDates) => {
  try {
    let reservationsFromBooking = bookings.map((o) => o.reservations)
    reservationsFromBooking = [].concat.apply([], reservationsFromBooking)
    const similars = []
    reservationsFromBooking.forEach((fromBooking) => {
      reservationDates.forEach((toCreate) => {
        if (moment(fromBooking).isSame(toCreate, 'day')) {
          if (similars.indexOf(toCreate) === -1) {
            similars.push(toCreate)
          }
        }
      })
    })
    return similars.length > 0
  } catch (err) {
    console.error(err)
    return true // to block reservations if has a error...
  }
}

const hasBlockTime = (bookings, checkInHour, checkOutHour) => {
  const hourlyFormat = 'HH:mm'
  try {
    const inMoment = moment(checkInHour, hourlyFormat)
    const outMoment = moment(checkOutHour, hourlyFormat)
    const blockedBookings = bookings.filter((o) => {
      const startMoment = moment(o.checkInHour, hourlyFormat)
      const endMoment = moment(o.checkOutHour, hourlyFormat)
      if (
        inMoment.isBetween(startMoment, endMoment) ||
        outMoment.isBetween(startMoment, endMoment)
      ) {
        return o
      }
    })
    return blockedBookings.length > 0
  } catch (err) {
    console.error(err)
    return true // to block reservations if has a error...
  }
}

const isAvailableThisDay = (
  checkInHour,
  checkOutHour,
  availableAccessHours
) => {
  const minutesOfTime = (time) => {
    const hour = time.split(':')[0]
    const minute = time.split(':')[1]
    const instance = moment().set({ hour, minute })
    return instance.minutes() + instance.hours() * 60
  }
  const minutesOfDate = (date) => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (timeZone === 'Australia/Sydney') {
      let hours = date.getHours().toString()
      hours = hours.padStart(2, '0')
      let minutes = date.getMinutes().toString()
      minutes = minutes.padStart(2, '0')
      let month = date.getMonth() + 1
      month = month.toString().padStart(2, '0')
      let day = date.getDate().toString()
      day = day.padStart(2, '0')
      const baseDate = `${date.getFullYear()}-${month}-${day}T${hours}:${minutes}:00.000Z`
      const instance = moment(baseDate)
      return instance.minutes() + instance.hours() * 60
    }
    const instance = moment(date).utcOffset('+1100')
    return instance.minutes() + instance.hours() * 60
  }
  try {
    if (!availableAccessHours) return false
    if (availableAccessHours.allday == 1) return true

    const checkInMin = minutesOfTime(checkInHour)
    const checkOutMin = minutesOfTime(checkOutHour)

    const openMin = minutesOfDate(availableAccessHours.openHour)
    const closeMin = minutesOfDate(availableAccessHours.closeHour)

    if (
      (checkInMin >= openMin && checkInMin <= closeMin) &&
      (checkOutMin >= openMin && checkOutMin <= closeMin)
    ) {
      return true
    }
    return false
  } catch (err) {
    console.error('Error to validate Availability: ', err)
    throw err
  }
}

const getHourlyPeriod = (startTime, endTime) => {
  if (!startTime && !endTime) throw Error('Time not found.')
  if (!startTime || !endTime) return 0
  const startMoment = moment(startTime, 'HH:mm')
  const endMoment = moment(endTime, 'HH:mm')
  const hourDiff = endMoment.diff(startMoment, 'hours')
  const minDiff = moment.utc(endMoment.diff(startMoment)).format('mm')
  if (parseInt(hourDiff, 10) < 0) {
    throw Error('End time is bigger than Start time.')
  }
  if (parseInt(minDiff, 10) > 0) {
    throw Error('It is not possible to book a space with a half or less minutes of diference.')
  }
  return hourDiff
}

const getBookingPeriod = (bookingObject) => {
  const booking = resolveBooking(bookingObject)
  switch (booking.priceType) {
    case 'hourly':
      return getHourlyPeriod(booking.checkInHour, booking.checkOutHour)
    case 'daily':
      return booking.reservations.length
    default:
      return booking.period
  }
}

const getCalcTotalValue = (bookingObject) => {
  const bookingPeriod = getBookingPeriod(bookingObject)
  let total = bookingObject.basePrice * bookingPeriod
  total += total * bookingObject.guestServiceFee
  return total
}

module.exports = {
  calcTotal,
  getDates,
  getEndDate,
  BookingStates,
  BookingStatesArray,
  resolveBooking,
  getHourlyPeriod,
  hasBlockAvailabilities,
  hasBlockTime,
  isAvailableThisDay,
  getCalcTotalValue
}

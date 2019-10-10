import moment from 'moment'

import { ListingAccessDays, ListingAccessHours } from './../models'

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
    throw Error(
      'It is not possible to book a space with a half or less minutes of diference.'
    )
  }
  return hourDiff
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

const minutesOf = (momentTime) => momentTime.minutes() + momentTime.hours() * 60

const isAvailableThisDay = async (
  listingId,
  date,
  checkInHour,
  checkOutHour
) => {
  const hourlyFormat = 'HH:mm'
  try {
    const weekDay = moment(date).day()
    const accessDay = await ListingAccessDays.findOne({ where: { listingId } })
    const accessHours = await ListingAccessHours.findOne({
      where: {
        listingAccessDaysId: accessDay.id,
        weekday: `${weekDay}`
      }
    })
    if (!accessHours) return false
    if (accessHours.allday == 1) return true
    
    const checkInMin = minutesOf(moment(checkInHour, hourlyFormat))
    const checkOutMin = minutesOf(moment(checkOutHour, hourlyFormat))
    console.log('Check Hours: ', checkInHour, checkInMin, checkOutHour, checkOutMin)
    
    const openMin = minutesOf(moment(accessHours.openHour, hourlyFormat))
    const closeMin = minutesOf(moment(accessHours.closeHour, hourlyFormat))
    console.log('Open/Close Hours: ', accessHours.openHour, openMin, accessHours.closeHour, closeMin)

    if (
      (checkInMin >= openMin && checkInMin <= closeMin) &&
      (checkOutMin >= openMin && checkOutMin <= closeMin)
    ) {
      return true
    }
    return false
  } catch (err) {
    console.error('Error to validate Week Availability: ', err)
    throw err
  }
}

export {
  calcTotal,
  getDates,
  getEndDate,
  BookingStates,
  BookingStatesArray,
  resolveBooking,
  getHourlyPeriod,
  hasBlockAvailabilities,
  hasBlockTime,
  isAvailableThisDay
}

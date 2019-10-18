import moment from 'moment'

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

const isAvailableThisDay = (
  checkInHour,
  checkOutHour,
  availableAccessHours
) => {
  const minutesOfTime = (date) => {
    const hour = date.split(':')[0]
    const minute = date.split(':')[1]
    const instance = moment().utcOffset('+1100')
    instance.set({ hour, minute })
    console.log('minutesOfTime: ', instance.toString())
    return instance.minutes() + instance.hours() * 60
  }
  const minutesOfDate = (date) => {
    const instance = moment(date).utcOffset('+1100')
    console.log('minutesOfDate: ', instance.toString())
    return instance.minutes() + instance.hours() * 60
  }
  try {
    if (!availableAccessHours) return false
    if (availableAccessHours.allday == 1) return true
    
    const checkInMin = minutesOfTime(checkInHour)
    const checkOutMin = minutesOfTime(checkOutHour)
    console.log('check in/out hour: ', checkInMin, checkOutMin)
    
    const openMin = minutesOfDate(availableAccessHours.openHour)
    const closeMin = minutesOfDate(availableAccessHours.closeHour)
    console.log('open in/out hour: ', openMin, closeMin)
    
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

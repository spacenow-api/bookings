const {
  getHourlyPeriod,
  hasBlockTime,
  isAvailableThisDay
} = require('./../validations')

test('Throwing exception when not have start and end time.', () => {
  expect(() => getHourlyPeriod()).toThrow()
})

test('Expecting zero for start time but not end.', () => {
  expect(getHourlyPeriod('12:00')).toBe(0)
})

test('Expecting 4 hours as a valid period.', () => {
  expect(getHourlyPeriod('12:00', '16:00')).toBe(4)
})

test('Expecting 5 hours even with minutes included.', () => {
  expect(getHourlyPeriod('12:30', '17:30')).toBe(5)
})

test('Expecting an exception error when receive a half hour.', () => {
  expect(() => getHourlyPeriod('12:30', '16:00')).toThrow(
    'It is not possible to book a space with a half or less minutes of diference.'
  )
})

test('Expecting false for blocked time.', () => {
  const bookings = [
    {
      checkInHour: '11:00',
      checkOutHour: '14:00'
    }
  ]
  expect(hasBlockTime(bookings, '10:00', '11:00')).toBe(false)
})

test('Expecting true to an unvailable time table.', () => {
  const bookings = [
    {
      checkInHour: '11:00',
      checkOutHour: '14:00'
    }
  ]
  expect(hasBlockTime(bookings, '10:00', '12:00')).toBe(true)
})

test('Expecting true to an unvailable time table with half hour.', () => {
  const bookings = [
    {
      checkInHour: '10:30',
      checkOutHour: '16:30'
    }
  ]
  expect(hasBlockTime(bookings, '11:30', '17:30')).toBe(true)
})

test('Expect a false availability when access hours does not exist.', () => {
  expect(isAvailableThisDay('11:00', '14:00', null)).toBe(false)
})

test('Expect a true availability for a 24/7 listing.', () => {
  const availableAccessHours = { allday: 1 }
  expect(isAvailableThisDay('11:00', '14:00', availableAccessHours)).toBe(true)
})

test('Expect a true availability for open days.', () => {
  const availableAccessHours = {
    allday: 0,
    openHour: new Date('2019-09-19 22:00:00.0'),
    closeHour: new Date('2019-09-20 07:00:00.0')
  }
  const isAvailable = isAvailableThisDay('08:00', '17:00', availableAccessHours)
  expect(isAvailable).toBe(true)
})

test('Expect a false availability for open days.', () => {
  const availableAccessHours = {
    allday: 0,
    openHour: new Date('2019-09-19 22:00:00.0'),
    closeHour: new Date('2019-09-20 07:00:00.0')
  }
  const isAvailable = isAvailableThisDay('07:00', '17:00', availableAccessHours)
  expect(isAvailable).toBe(false)
})

test('Expect a true availability for daily save time.', () => {
  const availableAccessHours = {
    allday: 0,
    openHour: new Date('2020-01-01 21:00:00.0'),
    closeHour: new Date('2020-01-01 06:00:00.0')
  }
  const isAvailable = isAvailableThisDay('08:00', '17:00', availableAccessHours)
  expect(isAvailable).toBe(true)
})

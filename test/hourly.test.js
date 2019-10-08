import { getHourlyPeriod, hasBlockTime } from './../validations'

test('Throwing exception when not have start and end time.', () => {
  expect(() => getHourlyPeriod()).toThrow()
})

test('Expecting zero for start time but not end.', () => {
  expect(getHourlyPeriod('12:00:00')).toBe(0)
})

test('Expecting 4 hours as a valid period.', () => {
  expect(getHourlyPeriod('12:00:00', '16:00:00')).toBe(4)
})

test('Expecting 5 hours even with minutes included.', () => {
  expect(getHourlyPeriod('12:30:00', '17:30:00')).toBe(5)
})

test('Expecting an exception error when receive a half hour.', () => {
  expect(() => getHourlyPeriod('12:30:00', '16:00:00')).toThrow(
    'It is not possible to book a space with a half or less minutes of diference.'
  )
})

test('Expecting false for blocked time.', () => {
  const bookings = [
    {
      checkInHour: '11:00:00',
      checkOutHour: '14:00:00'
    }
  ]
  expect(hasBlockTime(bookings, '10:00:00', '11:00:00')).toBe(false)
})

test('Expecting true to an unvailable time table.', () => {
  const bookings = [
    {
      checkInHour: '11:00:00',
      checkOutHour: '14:00:00'
    }
  ]
  expect(hasBlockTime(bookings, '10:00:00', '12:00:00')).toBe(true)
})

test('Expecting true to an unvailable time table with half hour.', () => {
  const bookings = [
    {
      checkInHour: '10:30:00',
      checkOutHour: '16:30:00'
    }
  ]
  expect(hasBlockTime(bookings, '11:30:00', '17:30:00')).toBe(true)
})

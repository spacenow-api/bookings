import { getHourlyPeriod } from './../validations'

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
  expect(() => getHourlyPeriod('12:30:00', '16:00:00')).toThrow('It is not possible to book a space with a half or less minutes of diference.')
})

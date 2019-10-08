import { success, failure } from '../libs/response-lib'
import { getHourlyPeriod } from './../validations'

export async function main(event) {
  try {
    const data = JSON.parse(event.body)
    const howManyHours = getHourlyPeriod(data.checkInHour, data.checkOutHour)
    return success({ status: true, hours: howManyHours })
  } catch (err) {
    console.error(err)
    return failure({ status: false, error: err.message })
  }
}

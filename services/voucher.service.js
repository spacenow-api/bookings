const moment = require('moment')

const { Bookings, Vouchers } = require('./../models')
const { resolveBooking } = require('./../validations')
const bookingService = require('./booking.service')

async function getNewCode() {
  const code = Math.floor(100000 + Math.random() * 999999)
  const existing = await Vouchers.findOne({ where: { code } })
  if (existing) {
    return getNewCode()
  }
  return `SN${code}`
}

async function getVoucherByCode(voucherCode) {
  const voucherObj = await Vouchers.findOne({ where: { code: voucherCode } })
  if (!voucherObj) {
    throw new Error(`Voucher ${voucherCode} not found.`)
  }
  return voucherObj
}

async function list() {
  return Vouchers.findAll({ order: [['createdAt', 'DESC']] })
}

async function create({ type, value, usageLimit, expireAt }) {
  const newCode = await getNewCode()
  const expireAtUtc = moment(expireAt)
    .utc()
    .toString()
  const voucherCreated = await Vouchers.create({
    code: newCode,
    type: type,
    value: value,
    usageLimit: usageLimit,
    expireAt: expireAtUtc
  })
  return voucherCreated
}

async function doUpdateUsage(voucherObject, degrade = false) {
  try {
    const count = degrade
      ? voucherObject.usageCount - 1
      : voucherObject.usageCount + 1
    await Vouchers.update(
      { usageCount: count },
      { where: { id: voucherObject.id } }
    )
  } catch (err) {
    throw err
  }
}

async function desactive(voucherCode) {
  try {
    const voucherObj = await getVoucherByCode(voucherCode)
    await Vouchers.update(
      { status: 'disabled' },
      { where: { id: voucherObj.id } }
    )
    return Vouchers.findOne({ where: { id: voucherObj.id }, raw: true })
  } catch (err) {
    throw err
  }
}

async function validateExpireTime(voucherCode) {
  try {
    const voucherObj = await getVoucherByCode(voucherCode)
    // Check if voucher has been disabled...
    if (voucherObj.status === 'disabled') {
      return { status: 'DISABLED' }
    }
    // Check if voucher has already been used...
    if (voucherObj.usageCount == voucherObj.usageLimit) {
      return { status: 'USED' }
    }
    // Check if voucher is already expired...
    const currentTime = moment().utc()
    const expireTime = moment(voucherObj.expireAt).utc()
    if (currentTime.isAfter(expireTime)) {
      return { status: 'EXPIRED' }
    }
    return { status: 'VALID', data: voucherObj }
  } catch (err) {
    throw err
  }
}

async function getOrThrowVoucher(voucherCode) {
  try {
    const validation = await validateExpireTime(voucherCode)
    switch (validation.status) {
      case 'EXPIRED':
        throw new Error(`Voucher ${voucherCode} has been expired.`)
      case 'DISABLED':
        throw new Error(`Voucher ${voucherCode} was disabled.`)
      case 'USED':
        throw new Error(`Voucher ${voucherCode} has already been used.`)
      default:
        return validation.data
    }
  } catch (err) {
    throw err
  }
}

async function insertVoucher(voucherCode, bookingId) {
  try {
    const bookingObj = await Bookings.findOne({ where: { bookingId } })
    if (!bookingObj) throw new Error(`Booking ${bookingId} not found.`)
    if (bookingObj.voucherId) {
      console.warn(`Booking ${bookingId} has already a Voucher code.`)
      return resolveBooking(bookingObj)
    }
    if (bookingObj.paymentState !== 'pending') {
      throw new Error(`Booking ${bookingId} has already been paid.`)
    }
    const voucherObj = await getOrThrowVoucher(voucherCode)
    const voucherType = voucherObj.type
    const bookingTotalValue = bookingService.getCalcTotalValue(bookingObj)
    if (voucherType === 'percentual') {
      // Removing percentual...
      const lessPercentual = bookingTotalValue * (voucherObj.value / 100)
      const bookingAmount = bookingTotalValue - lessPercentual
      await Bookings.update(
        { totalPrice: bookingAmount, voucherId: voucherObj.id },
        { where: { bookingId } }
      )
    } else if (voucherType === 'zerofee') {
      // Removing Fee by Voucher...
      const lessFee = bookingTotalValue * bookingObj.guestServiceFee
      const bookingAmount = bookingTotalValue - lessFee
      await Bookings.update(
        {
          totalPrice: bookingAmount,
          voucherId: voucherObj.id
        },
        { where: { bookingId } }
      )
    } else {
      // Value Type...
      await Bookings.update(
        {
          totalPrice: bookingTotalValue - voucherObj.value,
          voucherId: voucherObj.id
        },
        { where: { bookingId } }
      )
    }
    await doUpdateUsage(voucherObj)
    return resolveBooking(await Bookings.findOne({ where: { bookingId } }))
  } catch (err) {
    throw err
  }
}

async function removeVoucher(voucherCode, bookingId) {
  try {
    const bookingObj = await Bookings.findOne({ where: { bookingId } })
    if (!bookingObj) throw new Error(`Booking ${bookingId} not found.`)
    if (!bookingObj.voucherId) {
      console.warn(`Booking ${bookingId} does not have a Voucher.`)
      return resolveBooking(bookingObj)
    }
    if (bookingObj.paymentState !== 'pending') {
      throw new Error(`Booking ${bookingId} has already been paid.`)
    }
    const bookingAmount = bookingService.getCalcTotalValue(bookingObj)
    await Bookings.update(
      { totalPrice: bookingAmount, voucherId: null },
      { where: { bookingId } }
    )
    const voucherObj = await getVoucherByCode(voucherCode)
    await doUpdateUsage(voucherObj, true)
    return resolveBooking(await Bookings.findOne({ where: { bookingId } }))
  } catch (err) {
    throw err
  }
}

module.exports = {
  list,
  create,
  desactive,
  validateExpireTime,
  insertVoucher,
  removeVoucher
}

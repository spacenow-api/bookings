const { Bookings, Vouchers } = require('./../models')
const { resolveBooking, getCalcTotalValue } = require('./../validations')

const MIN_CODE = 100000
const MAX_CODE = 999999

async function getNewCode() {
  const code = Math.floor(Math.random() * (MAX_CODE - MIN_CODE + 1)) + MIN_CODE
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

async function create({ type, value, usageLimit }) {
  const newCode = await getNewCode()
  const voucherCreated = await Vouchers.create({
    code: newCode,
    type: type,
    value: value,
    usageLimit: usageLimit
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

async function validate(voucherCode) {
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
    return { status: 'VALID', data: voucherObj }
  } catch (err) {
    throw err
  }
}

async function getOrThrowVoucher(voucherCode) {
  try {
    const validation = await validate(voucherCode)
    switch (validation.status) {
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
    if (bookingObj.voucherCode) {
      console.warn(`Booking ${bookingId} has already a Voucher code.`)
      return resolveBooking(bookingObj)
    }
    if (bookingObj.bookingState !== 'approved') {
      throw new Error(`Booking ${bookingId} is not approved or ready to be paid.`)
    }
    if (bookingObj.paymentState !== 'pending') {
      throw new Error(`Booking ${bookingId} has already been paid.`)
    }
    const voucherObj = await getOrThrowVoucher(voucherCode)
    const voucherType = voucherObj.type
    const bookingTotalValue = getCalcTotalValue(bookingObj)
    if (voucherType === 'percentual') {
      // Removing percentual...
      const lessPercentual = bookingTotalValue * (voucherObj.value / 100)
      const bookingAmount = bookingTotalValue - lessPercentual
      await Bookings.update(
        { 
          totalPrice: bookingAmount, 
          voucherCode: voucherObj.code
        },
        { where: { bookingId } }
      )
    } else if (voucherType === 'zerofee') {
      // Removing Fee by Voucher...
      const lessFee = bookingTotalValue * bookingObj.guestServiceFee
      const bookingAmount = bookingTotalValue - lessFee
      await Bookings.update(
        {
          totalPrice: bookingAmount,
          voucherCode: voucherObj.code
        },
        { where: { bookingId } }
      )
    } else {
      // Value Type...
      await Bookings.update(
        {
          totalPrice: bookingTotalValue - voucherObj.value,
          voucherCode: voucherObj.code
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
    if (!bookingObj.voucherCode) {
      console.warn(`Booking ${bookingId} does not have a Voucher.`)
      return resolveBooking(bookingObj)
    }
    if (bookingObj.paymentState !== 'pending') {
      throw new Error(`Booking ${bookingId} has already been paid.`)
    }
    const bookingAmount = getCalcTotalValue(bookingObj)
    await Bookings.update(
      { 
        totalPrice: bookingAmount, 
        voucherCode: null
      },
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
  validate,
  insertVoucher,
  removeVoucher
}

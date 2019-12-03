const moment = require('moment')

const { Bookings, Vouchers } = require('./../models')

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

async function create({ type, value, isUnique, expireAt }) {
  const newCode = await getNewCode()
  const expireAtUtc = moment(expireAt)
    .utc()
    .toString()
  const voucherCreated = await Vouchers.create({
    code: newCode,
    type: type,
    value: value,
    unique: isUnique,
    expireAt: expireAtUtc
  })
  return voucherCreated
}

async function updateUsage(voucherCode) {
  try {
    const { status } = await validateExpireTime(voucherCode)
    if (status === 'VALID') {
      const voucherObj = await getVoucherByCode(voucherCode)
      await Vouchers.update(
        { usageCount: voucherObj.usageCount + 1 },
        { where: { id: voucherObj.id } }
      )
      return Vouchers.findOne({ where: { id: voucherObj.id }, raw: true })
    }
    throw new Error(`Voucher ${voucherCode} has been expired.`)
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
    const currentTime = moment().utc()
    const expireTime = moment(voucherObj.expireAt).utc()
    if (currentTime.isAfter(expireTime)) {
      return { status: 'EXPIRED' }
    }
    // Check if voucher has already be used...
    const bookingReturn = await Bookings.findOne({
      where: { voucherId: voucherObj.id }
    })
    if (bookingReturn) {
      return { status: 'USED' }
    }
    return { status: 'VALID' }
  } catch (err) {
    throw err
  }
}

async function insertVoucher(voucherCode, bookingId) {
  try {
    const bookingObj = await Bookings.findOne({ where: { bookingId } })
    if (!bookingObj) throw new Error(`Booking ${bookingId} not found.`)
    const voucherObj = await getVoucherByCode(voucherCode)
    const voucherType = voucherObj.type
    if (voucherType === 'percentual') {
      // Removing percentual...
      const lessPercentual = bookingObj.totalPrice * (voucherObj.value / 100)
      const bookingAmount = bookingObj.totalPrice - lessPercentual
      await Bookings.update(
        { totalPrice: bookingAmount, voucherId: voucherObj.id },
        { where: { bookingId } }
      )
      return Bookings.findOne({ where: { bookingId } })
    } else if (voucherType === 'zerofee') {
      // Removing Fee by Voucher...
      const lessFee = bookingObj.totalPrice * bookingObj.guestServiceFee
      const bookingAmount = bookingObj.totalPrice - lessFee
      await Bookings.update(
        {
          totalPrice: bookingAmount,
          voucherId: voucherObj.id
        },
        { where: { bookingId } }
      )
      return Bookings.findOne({ where: { bookingId } })
    }
    // Value Type...
    await Bookings.update(
      {
        totalPrice: bookingObj.totalPrice - voucherObj.value,
        voucherId: voucherObj.id
      },
      { where: { bookingId } }
    )
    return Bookings.findOne({ where: { bookingId } })
  } catch (err) {
    throw err
  }
}

async function removeVoucher(voucherCode, bookingId) {
  try {
    const bookingObj = await Bookings.findOne({ where: { bookingId } })
    if (!bookingObj) throw new Error(`Booking ${bookingId} not found.`)
    const voucherObj = await getVoucherByCode(voucherCode)
    const voucherType = voucherObj.type
    if (voucherType === 'percentual') {
      // Adding percentual...
      const plusPercentual = bookingObj.totalPrice * (voucherObj.value / 100)
      const bookingAmount = bookingObj.totalPrice + plusPercentual
      await Bookings.update(
        { totalPrice: bookingAmount, voucherId: voucherObj.id },
        { where: { bookingId } }
      )
      return Bookings.findOne({ where: { bookingId } })
    } else if (voucherType === 'zerofee') {
      // Adding Fee by Voucher...
      const plusFee = bookingObj.totalPrice * bookingObj.guestServiceFee
      const bookingAmount = bookingObj.totalPrice + plusFee
      await Bookings.update(
        {
          totalPrice: bookingAmount,
          voucherId: voucherObj.id
        },
        { where: { bookingId } }
      )
      return Bookings.findOne({ where: { bookingId } })
    }
    // Value Type...
    await Bookings.update(
      {
        totalPrice: bookingObj.totalPrice + voucherObj.value,
        voucherId: voucherObj.id
      },
      { where: { bookingId } }
    )
    return Bookings.findOne({ where: { bookingId } })
  } catch (err) {
    throw err
  }
}

module.exports = {
  create,
  updateUsage,
  desactive,
  validateExpireTime,
  insertVoucher,
  removeVoucher
}

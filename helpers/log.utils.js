module.exports = {

  log(bookingId = '', text = '') {
    try {
      const date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
      console.info(`Booking | ${bookingId} | ${date} | ${text}`)
    } catch (_) {
    }
  }
}
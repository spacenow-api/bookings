import moment from 'moment';

/**
 * Possible Spacenow bookings States;
 */
const BookingStates = {
  PEDDING: 'pedding',
  CANCELLED: 'cancelled',
  TIMEOUT: 'timeout',
  REQUESTED: 'requested'
};
const BookingStatesArray = Object.values(BookingStates);

const calcTotal = (basePrice, quantity = 1, period, guestFee) => {
  let total = basePrice * quantity * period;
  total += total * guestFee;
  return total;
};

const getEndDate = (startDate, period, priceType) => {
  var eDate;
  switch (priceType) {
    case 'daily':
      eDate = moment(startDate).add(period, 'days');
      break;
    case 'weekly':
      eDate = moment(startDate).add(period, 'weeks');
      break;
    case 'monthly':
      eDate = moment(startDate).add(period, 'months');
      break;
  }
  return eDate;
};

const getDates = (startDate, endDate) => {
  var arrDates = [];
  var sDate = moment(startDate);
  var eDate = moment(endDate);
  while (sDate < eDate) {
    arrDates.push(sDate.toISOString());
    sDate = sDate.clone().add(1, 'd');
  }
  return arrDates;
};

export { calcTotal, getDates, getEndDate, BookingStates, BookingStatesArray };

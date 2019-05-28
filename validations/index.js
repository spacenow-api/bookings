import moment from 'moment';

const calcTotal = (basePrice, quantity = 1, period, guestFee) => {
  return basePrice * quantity * period * guestFee;
}

const getEndDate = (startDate, period, bookingType) => {
  var eDate = moment(startDate, "DD-MM-YYYY");

  switch(bookingType) {
    case 'daily':
      eDate.add(period, 'days')
      break;
    case 'weekly':
      eDate.add(period, 'weeks')
      break;
    case 'monthly':
      eDate.add(period, 'months')
      break;
  }

  return eDate;

}

const getDates = (startDate, endDate) => {

  var arrDates = new Array();
  var sDate = new Date(startDate)
  var eDate = new Date(endDate);
  while (sDate <= eDate) {
    arrDates.push(sDate)
    sDate = sDate.addDays(1);
  }
  return arrDates;

}

export { calcTotal, getDates, getEndDate };

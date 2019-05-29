import moment from 'moment';

const calcTotal = (basePrice, quantity = 1, period, guestFee) => {
  return basePrice * quantity * period * guestFee;
}

const getEndDate = (startDate, period, bookingType) => {
  
  var eDate;

  switch(bookingType) {
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

  console.log("END DATE GET", eDate)

  return eDate;

}

const getDates = (startDate, endDate) => {

  var arrDates = [];
  var sDate = moment(startDate);
  var eDate = moment(endDate);
  
  while (sDate <= eDate) {
    arrDates.push(sDate.toDate());
    sDate = sDate.clone().add(1, 'd');
  }

  console.log("ARRAY DATES", arrDates);

  return arrDates;

}

export { calcTotal, getDates, getEndDate };

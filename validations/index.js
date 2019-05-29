import moment from 'moment';

const calcTotal = (basePrice, quantity = 1, period, guestFee) => {
  return basePrice * quantity * period * guestFee;
}

const getEndDate = (startDate, period, bookingType) => {
  
  switch(bookingType) {
    case 'daily':
      return moment(startDate).add(period, 'days');
    case 'weekly':
      return moment(startDate).add(period, 'weeks');
    case 'monthly':
      return moment(startDate).add(period, 'months');
  }

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

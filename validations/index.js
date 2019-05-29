import moment from 'moment';

const calcTotal = (basePrice, quantity = 1, period, guestFee) => {
  return basePrice * quantity * period * guestFee;
}

const getEndDate = (startDate, period, bookingType) => {
  
  switch(bookingType) {
    case 'daily':
      return moment(startDate).add(period, 'days').format('DD-MM-YYYY');
    case 'weekly':
      return moment(startDate).add(period, 'weeks').format('DD-MM-YYYY');
    case 'monthly':
      return moment(startDate).add(period, 'months').format('DD-MM-YYYY');
  }

}

const getDates = (startDate, endDate) => {

  var arrDates = [];
  var sDate = moment(startDate).format('DD-MM-YYYY');
  var eDate = moment(endDate).format('DD-MM-YYYY');
  
  while (sDate <= eDate) {
    arrDates.push(sDate.toDate().format('DD-MM-YYYY'));
    sDate = sDate.clone().add(1, 'd');
  }

  console.log("ARRAY DATES", arrDates);

  return arrDates;

}

export { calcTotal, getDates, getEndDate };

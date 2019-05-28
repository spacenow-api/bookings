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

  var arrDates = new Array();
  var sDate = new Date(startDate);
  var eDate = new Date(endDate);
  
  while (sDate <= eDate) {
    arrDates.push(new Date(sDate));
    sDate.setDate(sDate.getDate() + 1);
  }

  console.log("ARRAY DATES", arrDates);

  return arrDates;

}

export { calcTotal, getDates, getEndDate };

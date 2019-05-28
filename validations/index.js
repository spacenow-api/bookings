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

  console.log("END DATE", eDate);

  return eDate;

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

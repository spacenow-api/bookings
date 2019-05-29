import moment from 'moment';

const calcTotal = (basePrice, quantity = 1, period, guestFee) => {
  return basePrice * quantity * period * guestFee;
}

const getEndDate = (startDate, period, priceType) => {
  
  var eDate;

  switch(priceType) {
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

}

const getDates = (startDate, endDate) => {

  var arrDates = [];
  var sDate = moment(startDate);
  var eDate = moment(endDate);
  
  while (sDate < eDate) {
    arrDates.push(sDate.toISOString());
    sDate = sDate.clone().add(1, 'd');
  }

  return arrDates;

}

export { calcTotal, getDates, getEndDate };


import Moment from 'moment';



export function convertUTCDateToLocalDate(date) {
    var localDateTime = Moment(date).local();
    return localDateTime
}





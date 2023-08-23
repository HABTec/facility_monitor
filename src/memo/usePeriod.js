
import { generateFixedPeriods } from '@dhis2/multi-calendar-dates'
import moment from 'moment';
import { useMemo } from 'react'
import getCurrentDate from "../memo/getCurrentDate.js";


export default function usePeriods({periodType,generateYear,endDate,locale}){
    
    return useMemo(() => {
        const currentDate = getCurrentDate();

        const year = generateYear??currentDate.getFullYear();
        const endsBefore = moment(endDate??currentDate).format('yyyy-MM-DD')

        const generateFixedPeriodsPayload = {
            calendar:'gregory',
            periodType,
            year,
            endsBefore,
            locale:locale??'en',
            yearsCount: year - 1970 + 1,
        }

        const periods = generateFixedPeriods(generateFixedPeriodsPayload);
        return periods;
    },[periodType,generateYear,endDate]);
}

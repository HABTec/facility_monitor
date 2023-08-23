import { Button, IconArrowRight24, IconArrowLeft24 } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'

import classes from "../App.module.css";

const startYear = 1970

export default function YearNavigator({ maxYear, year, onYearChange, disabled}) {
    return (
        <div className={classes.yearContainer}>
            <Button
                dataTest="yearnavigator-backbutton"
                disabled={year === startYear || disabled}
                onClick={() => onYearChange(year - 1)}
                icon={<IconArrowLeft24 />}
            />
            <span 
                className={classes.year}
                data-test="yearnavigator-currentyear"
            >
                {year}
            </span>
            <Button
                dataTest="yearnavigator-forwardbutton"
                disabled={year === maxYear || disabled}
                onClick={() => onYearChange(year + 1)}
                icon={<IconArrowRight24 />}
            />
        </div>
    )
}

YearNavigator.propTypes = {
    maxYear: PropTypes.number,
    year: PropTypes.number,
    onYearChange: PropTypes.func,
}

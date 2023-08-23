import { DataQuery } from "@dhis2/app-runtime";
import i18n from "@dhis2/d2-i18n";
import React from "react";
import classes from "../App.module.css";
import { SingleSelectOption, SingleSelectField } from "@dhis2/ui";
import YearNavigator from "../components/YearNavigator.js";

const PeroidSelect = (props) => {
  const { onChange, periods, selected, label, year, onYearChange, maxYear,disabled} =
    props;
  // const periods = usePeriods({periodType:'DAILY',year:getCurrentDate().getFullYear(),endDate:getCurrentDate()});;

  // console.log(selectedPeriods,'testes');

  const selectOptions = periods?.map((element) => (
    <SingleSelectOption
      key={element?.id}
      label={element?.name}
      value={element?.id}
    />
  ));

  return (
    <div className={classes.periodSelector}>
      <div className={classes.periodSelectorInput}>
        <SingleSelectField
          required={!disabled}
          inputWidth="250px"
          label={label}
          className="select"
          selected={selected}
          onChange={onChange}
          disabled={disabled}
        >
          {selectOptions}
        </SingleSelectField>
      </div>
      <YearNavigator
        year={year}
        onYearChange={onYearChange}
        maxYear={maxYear}
        disabled={disabled}
      />
    </div>
  );
};

export default PeroidSelect;

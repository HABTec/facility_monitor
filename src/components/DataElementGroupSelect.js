import { DataQuery } from "@dhis2/app-runtime";
import i18n from "@dhis2/d2-i18n";
import React from "react";
import classes from "../App.module.css";
import { SingleSelectOption, SingleSelectField } from "@dhis2/ui";

const DataElementGroupSelect = (props) => {
  const { onChange, dataElementGroups, selected, label } = props;

  const selectOptions = dataElementGroups?.map((element) => (
    <SingleSelectOption
      key={element.id}
      label={element?.displayName}
      value={element?.id}
    />
  ));

  return (
    <SingleSelectField required inputWidth="400px" label={label} className="select" selected={selected} onChange={onChange}>
      {selectOptions}
    </SingleSelectField>
  );
};

export default DataElementGroupSelect;

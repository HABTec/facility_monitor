import { DataQuery, useDataQuery } from "@dhis2/app-runtime";
import i18n from "@dhis2/d2-i18n";
import React from "react";
import classes from "./App.module.css";
import Home from "./pages/Home.js";
import { useState } from "react";

const meQuery = {
  me: {
    resource: "me",
  },
  dataElementGroups: {
    resource: "dataElementGroups",
    params: {
      paging: false,
    },
  },
  orgUnitLevels:{
    resource:'filledOrganisationUnitLevels'
  }
};

const dataElementGroups = {};

const MyApp = () => {
  const { Loading, error, data } = useDataQuery(meQuery);
  if (error) return <span>Error: {error.message}</span>;
  if (Loading) return <span>Loading...</span>;
  return (
    <Home
      me={data?.me}
      dataElementGroups={data?.dataElementGroups?.dataElementGroups}
      maxOrgUnitLevels={data?.orgUnitLevels?.length}
    ></Home>
  );
};

export default MyApp;

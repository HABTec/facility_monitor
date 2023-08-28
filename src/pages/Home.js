import React from "react";
import classes from "../App.module.css";
import { OrganisationUnitTree, Pagination } from "@dhis2/ui";
import { useState, useEffect } from "react";
import DataElementGroupSelect from "../components/DataElementGroupSelect.js";
import PeroidSelect from "../components/PeriodSelect.js";
import getCurrentDate from "../memo/getCurrentDate.js";
import usePeriods from "../memo/usePeriod.js";
import { spacers, spacersNum, Tab, TabBar, Help } from "@dhis2/ui";

import { useDataQuery, useDataEngine } from "@dhis2/app-runtime";
import DataElementTable from "../components/DataElementTable";
import OrgunitWidget from "../components/OrgunitWidget";
import UserActivityTable from "../components/UserActivityTable";

//const selectedDataElmentGroupQuery = {
//  dataElements: {
//    resource: "dataElementGroups",
//    params: ({ selectedDataElementGroup }) => ({
//      fields: [
//        "dataElements[id,displayName,categoryCombo[categoryOptionCombos::size,],dataSetElements[dataSet[id,periodType,categoryCombo[categoryOptionCombos::size],]]]",
//      ],
//      filter: `id:eq:${selectedDataElementGroup}`,
//      paging: false,
//    }),
//  },
//};

//query orgunits that blong to a dataset and are memeber of an org unit and only facilities
const validOrgUnitsQuery = {
  orgUnits: ({ orgUnit, pageSize, level, page }) => ({
    resource: `organisationUnits`,
    params: {
      fields: ["id", "displayName"],
      filter: [`path:like:${orgUnit}`, `level:eq:${level}`],
      total: true,
      page: page,
      pageSize: pageSize,
    },
  }),
};

//
//const dataValueSetQuery = {
//  dataValues:({ period, dataElementGroup, orgUnit }) => ({
//    resource: "dataValueSets",
//    params: {
//      period,
//      orgUnit,
//      dataElementGroup,
//      children: true,
//    },
//  })
//};
// sqlViews?filter=displayName:like:userActivity
const userActivityViewQuery = {userActivityView:{
  resource: `sqlViews`,
  params: {
    fields: ["id", "displayName"],
    filter: [`displayName:eq:userActivity`],
    paging:false,
  },
}};

const Home = (props) => {
  const { me, maxOrgUnitLevels } = props;
  const engine = useDataEngine();
  const [selectedOrgUnit, setSelectedOrgUnit] = useState(null);
  const [selectedOrgUnits, setSelectedOrgUnits] = useState([]);
  const [orgUnits, setOrgUnits] = useState([]);
  const [selectedDataElementGroup, setSelectedDataElementGroup] = useState();

  const [dataValues, setDataValues] = useState([]);
  const [periodType, setPeriodtype] = useState("WEEKLY");
  const [dataSetId, setDataSetId] = useState();
  const [selectedPeriod, setSelectedPeriod] = useState();
  const [validOrgUnitCount, setValidOrgUnitCount] = useState();
  const currentYear = getCurrentDate();
  const [year, setYear] = useState(currentYear.getFullYear());

  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [totalPages, setTotalPages] = useState(10);

  const [showUserActivity, setShowUserActivity] = useState(false);

  const periods = usePeriods({
    periodType,
    generateYear: year,
    locale: me?.settings?.keyUiLocale,
  });
  const [dataElements, setDataElements] = useState(null);

  const handelLoadComplete = (data) => {
    setOrgUnits(data?.orgUnits?.organisationUnits ?? []);
    setPageCount(data?.orgUnits?.pager?.pageCount ?? 1);
    setPage(data?.orgUnits?.pager?.page ?? 1);
    setPageSize(data?.orgUnits?.pager?.pageSize ?? 10);
    setTotalPages(data?.orgUnits?.pager?.total ?? 10);
  };

  const [userActivityView,setUserActivityView] = useState(null);
  useDataQuery(userActivityViewQuery,{onComplete:(data)=>{
    if(data?.userActivityView?.sqlViews.length>0)
      setUserActivityView(data?.userActivityView?.sqlViews[0].id)
    else{
      alert("Error: create an sql view with name: userActivity, type:query and SQL: SELECT username,eventtype,extract(day from timestamp) as day,count(*) from datastatisticsevent where age(now(),timestamp) < '1 months'::interval and  username = '${username}' GROUP BY username,eventtype,extract(day from timestamp) ");
    }
  }});

  // console.log(engine.query(userActivityViewQuery).then(console.log));

  const { loading, error, data, refetch } = useDataQuery(validOrgUnitsQuery, {
    variables: {
      orgUnits,
      pageSize,
      page,
      level: selectedOrgUnit?.path?.split("/")?.length ?? 0,
    },
    onComplete: handelLoadComplete,
  });

  useEffect(() => {
    if (selectedOrgUnit)
      engine
        .query({
          orgUnits: validOrgUnitsQuery.orgUnits({
            orgUnit: selectedOrgUnit?.id,
            pageSize,
            page,
            level: selectedOrgUnit?.path?.split("/")?.length ?? 0,
          }),
        })
        .then(handelLoadComplete);
  }, [selectedOrgUnit?.id, page, pageSize]);

  const handelPeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  const handelPeriodTypeChange = (periodType) => {
    setPeriodtype(periodType);
  };

  const handelDataElementGroupChagne = (dataElementGroup) => {
    setSelectedDataElementGroup(dataElementGroup.selected);
    refetch({ selectedDataElementGroup: dataElementGroup.selected });
    //query data elements in the group and decide the period type here
  };

  const onChange = (org) => {
    let selected = [org.path];
    if (selectedOrgUnits.length > 0 && selectedOrgUnits[0]==org?.path) {
      setSelectedOrgUnits([]);
      setSelectedOrgUnit(null);
    } else {
      setSelectedOrgUnits(selected);
      setSelectedOrgUnit(org);
    }
    setPage(1);
  };

  const roots = me?.organisationUnits?.map((org) => org?.id);

  return (
    <div>
      <div style={{ margin: "20px" }}>Select OrgUnit</div>
      <div className={classes.flexbreak}>
        <div className={classes.container} style={{ flex: "1 1 400px" }}>
          {roots ? (
            <OrganisationUnitTree
              singleSelection
              selected={selectedOrgUnits}
              onChange={onChange}
              name="main orgunit"
              roots={roots}
            />
          ) : (
            <></>
          )}
          {selectedOrgUnit?.id ? (
            <OrgunitWidget orgunit={selectedOrgUnit}></OrgunitWidget>
          ) : (
            <></>
          )}
        </div>
        <div className={classes.container}>
          <TabBar>
            <Tab
              onClick={() => {
                setShowUserActivity(false);
              }}
              selected={!showUserActivity}
            >
              Facility Activity
            </Tab>
            <Tab
              onClick={() => {
                setShowUserActivity(true);
              }}
              selected={showUserActivity}
            >
              User Activity
            </Tab>
          </TabBar>

          {showUserActivity ? (
            <UserActivityTable
              selectedOrgUnit={selectedOrgUnit}
            ></UserActivityTable>
          ) : selectedOrgUnit?.id ? (
            <>
              <DataElementTable
                loading={loading}
                orgunits={orgUnits}
                selectedOrgUnit={selectedOrgUnit}
                setPage={setPage}
                setPageSize={setPageSize}
                page={page}
                pageCount={pageCount}
                pageSize={pageSize}
                total={totalPages}
                userActivityView={userActivityView}
              ></DataElementTable>
              
            </>
          ) : (
            <Help>Please select an org unit on the left</Help>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

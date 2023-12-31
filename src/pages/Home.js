import React from "react";
import classes from "../App.module.css";
import { OrganisationUnitTree, Pagination } from "@dhis2/ui";
import { useState, useEffect } from "react";
import getCurrentDate from "../memo/getCurrentDate.js";
import usePeriods from "../memo/usePeriod.js";
import { spacers, spacersNum, Tab, TabBar, Help } from "@dhis2/ui";

import { useDataQuery, useDataEngine } from "@dhis2/app-runtime";
import FacilityActivity from "../components/FacilityActivity";
import OrgunitWidget from "../components/OrgunitWidget";
import UserActivityTable from "../components/UserActivityTable";
import OnlineUserTable from "../components/OnlineUserTable";

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

// sqlViews?filter=displayName:like:userActivity
const userActivityViewQuery = {
  userActivityView: {
    resource: `sqlViews`,
    params: {
      fields: ["id", "displayName"],
      filter: [`displayName:in:[userActivity,userActivityCount]`],
      paging: false,
    },
  },
};

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

  const [showTab, setShowTab] = useState("default");

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

  const [userActivityView, setUserActivityView] = useState(null);
  const [userActivityCountView, setUserActivityCountView] = useState(null);
  useDataQuery(userActivityViewQuery, {
    onComplete: (data) => {
      if (data?.userActivityView?.sqlViews.length > 0) {
        let userActivityArray = data?.userActivityView?.sqlViews.filter(
          (e) => e.displayName == "userActivity"
        );
        let userActivityCountArray = data?.userActivityView?.sqlViews.filter(
          (e) => e.displayName == "userActivityCount"
        );

        if (userActivityArray.length > 0 || userActivityCountArray.length > 0) {
          setUserActivityView(userActivityArray[0].id);
          setUserActivityCountView(userActivityCountArray[0].id);
        } else
          alert(
            "Error: create two sql views with name: userActivity and userActivityCount, type:query and SQL: SELECT username,eventtype,extract(day from timestamp) as day,count(*) from datastatisticsevent where age(now(),timestamp) < '1 months'::interval and  username = '${username}' GROUP BY username,eventtype,extract(day from timestamp) userActivityCount's SQL must be SELECT username, eventtype, extract( day from timestamp ) as day,  count(*) from datastatisticsevent where  age(now(), timestamp) < '1 months' :: interval and username = '${username}' GROUP BY username, eventtype, extract( day  from timestamp ) "
          );
      } else {
        alert(
          "Error: create two sql views with name: userActivity and userActivityCount, type:query and SQL: SELECT username,eventtype,extract(day from timestamp) as day,count(*) from datastatisticsevent where age(now(),timestamp) < '1 months'::interval and  username = '${username}' GROUP BY username,eventtype,extract(day from timestamp) userActivityCount's SQL must be SELECT username, eventtype, extract( day from timestamp ) as day,  count(*) from datastatisticsevent where  age(now(), timestamp) < '1 months' :: interval and username = '${username}' GROUP BY username, eventtype, extract( day  from timestamp ) "
        );
      }
    },
  });

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
    if (selectedOrgUnits.length > 0 && selectedOrgUnits[0] == org?.path) {
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
                setShowTab("default");
              }}
              selected={showTab=="default"}
            >
              Facility Activity
            </Tab>
            <Tab
              onClick={() => {
                setShowTab("userActivity");
              }}
              selected={showTab == "userActivity"}
            >
              User Activity
            </Tab>
            <Tab
              onClick={() => {
                setShowTab("onlineUsers");
              }}
              selected={showTab == "onlineUsers"}
            >
              Users Online
            </Tab>
          </TabBar>

          {showTab == "userActivity" ? (
            <UserActivityTable
              selectedOrgUnit={selectedOrgUnit}
            ></UserActivityTable>
          ) : showTab == "default" ? (
            selectedOrgUnit?.id ? (
              <>
                <FacilityActivity
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
                  userActivityCountView={userActivityCountView}
                ></FacilityActivity>
              </>
            ) : (
              <Help>Please select an org unit on the left</Help>
            )
          ) : showTab == "onlineUsers" ? (
            <OnlineUserTable
              selectedOrgUnit={selectedOrgUnit}
            ></OnlineUserTable>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

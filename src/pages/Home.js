import React from "react";
import classes from "../App.module.css";
import { OrganisationUnitTree,Pagination } from "@dhis2/ui";
import { useState, useEffect } from "react";
import DataElementGroupSelect from "../components/DataElementGroupSelect.js";
import PeroidSelect from "../components/PeriodSelect.js";
import getCurrentDate from "../memo/getCurrentDate.js";
import usePeriods from "../memo/usePeriod.js";
import { spacers, spacersNum } from '@dhis2/ui';

import { useDataQuery, useDataEngine } from "@dhis2/app-runtime";
import DataElementTable from "../components/DataElementTable";

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
  orgUnits: ({ orgUnit, pageSize, level, page}) => ({
    resource: `organisationUnits`,
    params: {
      fields: ["id","displayName"],
      filter: [`path:like:${orgUnit}`,`level:eq:${level}`],
      total: true,
      page:page,
      pageSize:pageSize
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

const Home = (props) => {
  const { me, maxOrgUnitLevels } = props;
  const engine = useDataEngine();
  const [selectedOrgUnit, setSelectedOrgUnit] = useState(null);
  const [selectedOrgUnits, setSelectedOrgUnits] = useState([]);
  const [orgUnits, setOrgUnits] = useState([]);
  const [selectedDataElementGroup, setSelectedDataElementGroup] = useState();


  const [dataValues,setDataValues]= useState([]);
  const [periodType, setPeriodtype] = useState("WEEKLY");
  const [dataSetId, setDataSetId] = useState();
  const [selectedPeriod, setSelectedPeriod] = useState();
  const [validOrgUnitCount, setValidOrgUnitCount] = useState();
  const currentYear = getCurrentDate();
  const [year, setYear] = useState(currentYear.getFullYear());

  const [pageSize, setPageSize] = useState(10);
  const [page,setPage] = useState(1);
  const [pageCount,setPageCount] = useState(1);
  const [totalPages, setTotalPages] =useState(10);

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

  const { loading, error, data, refetch } = useDataQuery(
    validOrgUnitsQuery,
    {
      variables: { orgUnits,pageSize,page,level:selectedOrgUnit?.path?.split('/')?.length ?? 0},
      onComplete: handelLoadComplete,
    }
  );

  useEffect(() => {
    if (selectedOrgUnit)
      engine
        .query({
          orgUnits: validOrgUnitsQuery.orgUnits({
            orgUnit: selectedOrgUnit?.id,
            pageSize,
            page,
            level: selectedOrgUnit?.path?.split('/')?.length ?? 0
          }),
        })
        .then(handelLoadComplete);
  }, [selectedOrgUnit?.id,page,pageSize]);


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
    setSelectedOrgUnits(selected);
    setSelectedOrgUnit(org);
    setPage(1);
  };

  console.log(selectedOrgUnit);

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
        </div>
        <div className={classes.container}>

          { selectedOrgUnit?.id ?
          <DataElementTable
            loading={loading}
            orgunits={
              orgUnits
            }
            selectedOrgUnit={selectedOrgUnit}
          ></DataElementTable>:<></>}
            {pageCount>1?
            <Pagination className={classes.pagination}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                page={page}
                pageCount={pageCount}
                pageSize={pageSize}
                total={totalPages}
            />:<></>}

        </div>
      </div>
    </div>
  );
};

export default Home;

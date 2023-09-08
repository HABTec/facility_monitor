import React from "react";
import classes from "../App.module.css";
import { SingleSelectOption, SingleSelectField, Pagination } from "@dhis2/ui";
import YearNavigator from "./YearNavigator.js";
import DataElementRow from "../components/DataElementRow.js";
import UserActivityChart from "../components/UserActivityChart";
import {useState} from "react"
import {
  DataTable,
  TableHead,
  DataTableRow,
  DataTableColumnHeader,
  TableBody,
  DataTableCell,
  TableFoot,
  spacers,
  CircularLoader,
  Tooltip,Card, 
} from "@dhis2/ui";

const DataElementTable = ({
  loading,
  orgunits,
  selectedOrgUnit,
  pageCount,
  pageSize,
  setPageSize,
  setPage,
  page,
  total,
  userActivityView,
  userActivityCountView
}) => {
  
  const [selectedUser, setSelectedUser] = useState();
  const [showRolesBarChart,setShowRolesBarChart]= useState();
  const [selectedRow, setSelectedRow] =  useState(null);

  const rows = orgunits?.map((element) => (
    <DataElementRow
      selectedOrgUnit={selectedOrgUnit}
      orgunit={element}
      key={element?.id}
      userActivityView={userActivityView}
      userActivityCountView={userActivityCountView}
      showUserActivity={setSelectedUser}
      selectedUser={selectedUser}
      showRolesChart={setShowRolesBarChart}
      selectedRow={selectedRow}
      setSelectedRow={setSelectedRow}
    ></DataElementRow>
  ));

  return (<div style={{
        display: 'flex',
        marginRight: "2%",
      }}>
    <div
      style={{
        marginTop: spacers.dp24,
        marginRight: "2%",
        minWidth: spacers.dp384,
        maxWidth: "50%"
      }}
    >
      {loading ? (
        <CircularLoader small />
      ) : (
        <>
          <DataTable>
            <TableHead>
              <DataTableRow>
                <DataTableColumnHeader>OrgUnit</DataTableColumnHeader>
                <DataTableColumnHeader>Roles</DataTableColumnHeader>
                <DataTableColumnHeader>User Count</DataTableColumnHeader>
                <DataTableColumnHeader>Last Active</DataTableColumnHeader>
                <DataTableColumnHeader><Tooltip content="The number of days the user has been active during the last 30 days">Login Days</Tooltip></DataTableColumnHeader>
              </DataTableRow>
            </TableHead>
            <TableBody>{rows}</TableBody>
          </DataTable>
          
          {pageCount > 1 ? (
            <Pagination
              className={classes.pagination}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              page={page}
              pageCount={pageCount}
              pageSize={pageSize}
              total={total}
            />
          ) : (
            <></>
          )}
        </>
      )}
    </div> 
      <div style={{
          marginTop: spacers.dp24,
          minWidth: "50%",
          maxWidth: "50%"
        }}>
          {selectedUser?
          <UserActivityChart userActivityView={userActivityView} user={selectedUser} roles={showRolesBarChart}></UserActivityChart>:
            <></>
          }
        </div>
    </div>
  );
};

export default DataElementTable;

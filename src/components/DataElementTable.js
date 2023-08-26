import React from "react";
import classes from "../App.module.css";
import { SingleSelectOption, SingleSelectField,Pagination } from "@dhis2/ui";
import YearNavigator from "./YearNavigator.js";
import DataElementRow from "../components/DataElementRow.js";
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
} from "@dhis2/ui";

const DataElementTable = ({ loading, orgunits, selectedOrgUnit, pageCount, pageSize, setPageSize, setPage,page, total}) => {
  const rows = orgunits?.map((element) => (
    <DataElementRow
      selectedOrgUnit={selectedOrgUnit}
      orgunit={element}
      key={element?.id}
    ></DataElementRow>
  ));


  return (
    <div
      style={{
        marginTop: spacers.dp24,
        marginRight: "auto",
        minWidth: spacers.dp384,
      }}
    >
      {loading ? (
        <CircularLoader small />
      ) : (<>
        <DataTable>
          <TableHead>
            <DataTableRow>
              <DataTableColumnHeader>OrgUnit</DataTableColumnHeader>
              <DataTableColumnHeader>Roles</DataTableColumnHeader>
              <DataTableColumnHeader>User Count</DataTableColumnHeader>
              <DataTableColumnHeader>Last Active</DataTableColumnHeader>
            </DataTableRow>
          </TableHead>
          <TableBody>{rows}</TableBody>

        </DataTable>
        { pageCount > 1 ? (
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
      </>)}
    </div>
  );
};

export default DataElementTable;

import React from "react";
import classes from "../App.module.css";
import { SingleSelectOption, SingleSelectField, Switch } from "@dhis2/ui";
import YearNavigator from "./YearNavigator.js";
import DataElementRow from "./DataElementRow.js";
import { useState, useEffect } from "react";
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
  Help,
  Pagination,
  Chip,
} from "@dhis2/ui";

import { useDataQuery, useDataEngine } from "@dhis2/app-runtime";
import moment from "moment";

const UsersQuery = {
  InactiveUsers: ({ orgUnit, includeDisabled, page, pageSize, lastYear }) => {
    let filter = [`userCredentials.lastLogin:lt:${lastYear.toISOString()}`];
    if (orgUnit) filter.push(`organisationUnits.id:eq:${orgUnit}`);

    if (!includeDisabled)
      filter.push(`userCredentials.disabled:eq:${includeDisabled}`);

    return {
      resource: `users`,
      params: {
        fields: [
          "id",
          "name",
          "username",
          "phoneNumber",
          "userCredentials[username,disabled,lastLogin]",
          "userRoles[id,displayName]",
        ],
        filter,
        total: true,
        paging: true,
        page: page,
        pageSize: pageSize,
        includeChildren: true,
      },
    };
  },
};

const timeAgo = (prevDate) => {
  return moment(prevDate).fromNow();  
};

const UserActivityTable = ({ loading, orgunits, selectedOrgUnit }) => {
  const lastYear = new Date();
  lastYear.setFullYear(lastYear.getFullYear() - 1);

  const [includeDisabled, setIncludeDisabled] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [pageUser, setPageUser] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [users, setUsers] = useState();

  const engine = useDataEngine();

  const handelLoadComplete = (data) => {
    setPageCount(data?.InactiveUsers?.pager?.pageCount ?? 1);
    setPageUser(data?.InactiveUsers?.pager?.page ?? 1);
    setPageSize(data?.InactiveUsers?.pager?.pageSize ?? 10);
    setTotalPages(data?.InactiveUsers?.pager?.total ?? 10);
    setUsers(data?.InactiveUsers?.users);
  };

  useEffect(() => {
    engine
      .query({
        InactiveUsers: UsersQuery.InactiveUsers({
          orgUnit: selectedOrgUnit?.id ?? null,
          includeDisabled,
          pageSize,
          page: pageUser,
          lastYear,
        }),
      })
      .then(handelLoadComplete);
  }, [selectedOrgUnit?.id, includeDisabled, pageUser, pageSize]);

  const rows = users?.map((el) => (
    <DataTableRow key={el?.id}>
      <DataTableCell key={el?.id + "4"}>{el.name}</DataTableCell>
      <DataTableCell key={el?.id + "1"}>{el?.userCredentials?.username}</DataTableCell>
      <DataTableCell key={el?.id + "2"}>{el.phoneNumber}</DataTableCell>
      <DataTableCell key={el?.id + "5"}>
        {el.userRoles?.map((role) => (
          <Chip dense>{role.displayName}</Chip>
        ))}
      </DataTableCell>
      <DataTableCell key={el?.id + "3"}>
        {timeAgo(new Date(el.userCredentials?.lastLogin).getTime())}
      </DataTableCell>
    </DataTableRow>
  ));

  return (
    <div
      style={{
        marginTop: spacers.dp24,
        marginRight: "auto",
        minWidth: spacers.dp384,
      }}
    >
      <Help>
        The table shows users who are inactive for more than one year.
      </Help>
      <Switch
        checked={includeDisabled}
        label="Include disabled accounts"
        name="Include disabled accounts "
        onChange={(e) => {
          setIncludeDisabled(e.checked);
        }}
        className={classes.spaced}
      />

      <DataTable>
        <TableHead>
          <DataTableRow>
            <DataTableColumnHeader>Name</DataTableColumnHeader>
            <DataTableColumnHeader>Username</DataTableColumnHeader>
            <DataTableColumnHeader>Phone Number</DataTableColumnHeader>
            <DataTableColumnHeader>Roles</DataTableColumnHeader>
            <DataTableColumnHeader>Last Active</DataTableColumnHeader>
          </DataTableRow>
        </TableHead>
        <TableBody>{rows}</TableBody>
      </DataTable>
      <Pagination
        className={classes.pagination}
        onPageChange={setPageUser}
        onPageSizeChange={setPageSize}
        page={pageUser}
        pageCount={pageCount}
        pageSize={pageSize}
        total={totalPages}
      />
    </div>
  );
};

export default UserActivityTable;

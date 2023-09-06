import React from "react";
import classes from "../App.module.css";
import YearNavigator from "./YearNavigator.js";
import DataElementRow from "./DataElementRow.js";
import { useState, useEffect } from "react";
import {
  DataTable,
  spacers,
  CircularLoader,
  Help,
  Pagination,
  Chip,
  Switch,
  TableHead,
  DataTableColumnHeader,
  DataTableCell,
  TableFoot,
  Table,
  DataTableRow,
  DataTableBody,
  InputField,
  Tooltip,
  IconSearch24,
  Button,
} from "@dhis2/ui";

import { useDataQuery, useDataEngine } from "@dhis2/app-runtime";
import moment from "moment";

const timeAgo = (prevDate) => {
  return moment(prevDate).fromNow();
};

const UsersQuery = {
  InactiveUsers: {
    resource: `users`,
    params: ({
      orgUnit,
      includeDisabled,
      page,
      pageSize,
      lastYear,
      filters,
    }) => {
      let filter = [`userCredentials.lastLogin:lt:${lastYear.toISOString()}`];
      if (orgUnit) filter.push(`organisationUnits.id:eq:${orgUnit}`);

      if (!includeDisabled)
        filter.push(`userCredentials.disabled:eq:${includeDisabled}`);

      if (filters.name?.trim() != "")
        filter.push(`name:ilike:${filters.name.trim()}`);
      if (filters.username?.trim() != "")
        filter.push(`userCredentials.username:ilike:${filters.username.trim()}`);
      if (filters.role?.trim() != "")
        filter.push(`userCredentials.userRoles.name:ilike:${filters.role.trim()}`);
      if (filters.phoneNumber?.trim() != "")
        filter.push(`phoneNumber:ilike:${filters.phoneNumber.trim()}`);

      return {
        fields: [
          "id,name,phoneNumber,userCredentials[username,phoneNumber,disabled,lastLogin,userRoles[id,displayName]]",
        ],
        filter,
        total: true,
        paging: true,
        page: page,
        pageSize: pageSize,
        includeChildren: true,
      };
    },
  },
};
const UserActivityTable = ({ selectedOrgUnit }) => {
  const lastYear = new Date();
  lastYear.setFullYear(lastYear.getFullYear() - 1);

  const [includeDisabled, setIncludeDisabled] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [pageUser, setPageUser] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [users, setUsers] = useState();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("");

  const [refetcher, setRefetcher] = useState();

  const engine = useDataEngine();

  const handelLoadComplete = (data) => {
    setPageCount(data?.InactiveUsers?.pager?.pageCount ?? 1);
    setPageUser(data?.InactiveUsers?.pager?.page ?? 1);
    setPageSize(data?.InactiveUsers?.pager?.pageSize ?? 10);
    setTotalPages(data?.InactiveUsers?.pager?.total ?? 10);
    setUsers(data?.InactiveUsers?.users);
  };

  const userquery = useDataQuery(UsersQuery, {
    variables: {
      orgUnit: selectedOrgUnit?.id ?? null,
      includeDisabled,
      pageSize,
      page: pageUser,
      lastYear,
      filters: { username, phoneNumber, name, role },
    },
    onComplete: handelLoadComplete,
  });

  const filterChanged = (ev) => {
    console.log(ev);
    switch (ev.name) {
      case "name":
        setName(ev.value);
        break;

      case "username":
        setUsername(ev.value);
        break;

      case "phone":
        setPhoneNumber(ev.value);
        break;

      case "role":
        setRole(ev.value);
        break;
    }
  };

  useEffect(() => {
    userquery
      .refetch({
        orgUnit: selectedOrgUnit?.id ?? null,
        includeDisabled,
        pageSize,
        page: pageUser,
        lastYear,
        filters: { username, phoneNumber, name, role },
      })
      .then(handelLoadComplete);
  }, [selectedOrgUnit?.id, includeDisabled, pageUser, pageSize, refetcher]);

  const rows = users?.map((el) => (
    <DataTableRow key={el?.id}>
      <DataTableCell key={el?.id + "4"}>{el.name}</DataTableCell>
      <DataTableCell key={el?.id + "1"}>
        {el?.userCredentials?.username}
      </DataTableCell>
      <DataTableCell key={el?.id + "2"}>{el.phoneNumber}</DataTableCell>
      <DataTableCell key={el?.id + "5"}>
        {el.userCredentials?.userRoles?.map((role) => (
          <Chip key={role.id} dense onClick={()=>{setRole(role.displayName);setRefetcher((prev)=>!prev)}}>
            {role.displayName}
          </Chip>
        ))}
      </DataTableCell>
      <DataTableCell key={el?.id + "3"}>
        <Tooltip content={el?.userCredentials?.lastLogin}>
          {timeAgo(new Date(el.userCredentials?.lastLogin).getTime())}
        </Tooltip>
      </DataTableCell>
    </DataTableRow>
  ));

  const handelEnterKey = (e,b) => {
    if (b.key === "Enter") {
      setRefetcher((prev) => !prev);
    }
  };

  return (
    <div
      style={{
        marginTop: spacers.dp24,
        marginRight: "auto",
        minWidth: spacers.dp384,
      }}
    > 
    <div style={{marginBottom:spacers.dp8}}>
    <Help>
        The table shows users who are inactive for more than one year.
      </Help>
    </div>

      <DataTable>
        <TableHead>
          <DataTableRow>
            <DataTableColumnHeader>
              <InputField
                name="name"
                placeholder="Search Name"
                value={name}
                onChange={filterChanged}
                onKeyDown={handelEnterKey}
              />
            </DataTableColumnHeader>
            <DataTableColumnHeader>
              <InputField
                name="username"
                placeholder="Search username"
                value={username}
                onChange={filterChanged}
                onKeyDown={handelEnterKey}
              />
            </DataTableColumnHeader>
            <DataTableColumnHeader>
              <InputField
                name="phone"
                type="number"
                placeholder="Search phone number"
                value={phoneNumber}
                onChange={filterChanged}
                onKeyDown={handelEnterKey}
              />
            </DataTableColumnHeader>
            <DataTableColumnHeader>
              <InputField
                name="role"
                placeholder="Search role"
                onChange={filterChanged}
                onKeyDown={handelEnterKey}
                value={role}
              />
              <Switch
                checked={includeDisabled}
                label="Include disabled accounts"
                name="Include disabled accounts"
                onKeyDown={handelEnterKey}
                onChange={(e) => {
                  setIncludeDisabled(e.checked);
                }}
              />
            </DataTableColumnHeader>
            <DataTableColumnHeader>
              <Button icon={<IconSearch24 />} onClick={()=>{setRefetcher((prev) => !prev)}}/>
            </DataTableColumnHeader>
          </DataTableRow>
          <DataTableRow>
            <DataTableColumnHeader>Name</DataTableColumnHeader>
            <DataTableColumnHeader>Username</DataTableColumnHeader>
            <DataTableColumnHeader>Phone Number</DataTableColumnHeader>
            <DataTableColumnHeader>Roles</DataTableColumnHeader>
            <DataTableColumnHeader>Last Active</DataTableColumnHeader>
          </DataTableRow>
        </TableHead>
        <DataTableBody loading={userquery.loading}> {rows}</DataTableBody>
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

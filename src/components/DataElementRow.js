import React from "react";
import {
  DataTableRow,
  DataTableCell,
  CircularLoader,
  Tooltip,
  Chip,
} from "@dhis2/ui";
import { useState, useEffect } from "react";
import { useDataQuery, useDataEngine } from "@dhis2/app-runtime";
import moment from "moment";
const UsersQuery = {
  orgUnitUsers: ({ orgUnit }) => ({
    resource: `users`,
    params: {
      fields: [
        "id,name,userCredentials[username,disabled,lastLogin,userRoles[id,displayName]]",
      ],
      filter: [
        `organisationUnits.id:eq:${orgUnit?.id}`,
        `userCredentials.disabled:eq:false`,
      ],
      total: true,
      paging: true,
    },
  }),
};
const userActivityLog = {
  userActivity: ({ id, username }) => ({
    resource: `sqlViews`,
    id: `${id}/data.json`,
    params: {
      fields: ["id", "displayName"],
      var: [`username:${username}`],
      paging: true,
      pageSize: 1,
    },
  }),
};

const timeAgo = (prevDate) => {
  return moment(prevDate).fromNow();
};
const findLastLogin = (users) => {
  var maxPeriod = undefined;
  users.forEach((user) => {
    var user_login_date = new Date(user.userCredentials?.lastLogin ?? 0);
    if (maxPeriod == undefined) {
      maxPeriod = user_login_date;
    } else {
      if (maxPeriod < user_login_date) maxPeriod = user_login_date;
    }
  });
  return maxPeriod;
};

const findLastLoginUser = (users) => {
  var maxPeriod = undefined;
  let userRet = undefined;
  users.forEach((user) => {
    var user_login_date = new Date(user.userCredentials?.lastLogin ?? 0);
    if (maxPeriod == undefined) {
      maxPeriod = user_login_date;
      userRet = user;
    } else {
      if (maxPeriod < user_login_date) {
        maxPeriod = user_login_date;
        userRet = user;
      }
    }
  });
  return userRet;
};

const DataElementRow = ({
  orgunit,
  userActivityView,
  userActivityCountView,
  showUserActivity,
  selectedUser,
  showRolesChart,
  selectedRow,
  setSelectedRow,
}) => {
  const [lastLogin, setLastLogin] = useState(null);
  const [lastLoginUser, setLastLoginUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [frequency, setFrequency] = useState(null);

  const engine = useDataEngine();

  const handelLoadComplete = (data) => {
    // count all the users

    if (data?.orgUnits?.pager?.total > 0) {
      let lastUser = findLastLoginUser(data?.orgUnits?.users);
      setLastLogin(timeAgo(findLastLogin(data?.orgUnits?.users)?.getTime()));
      setLastLoginUser(lastUser);

      // Group users by role
      let internal_roles = [];

      for (let x = 0; x < data?.orgUnits?.users.length; x++) {
        const user = data?.orgUnits?.users[x];

        // Check if there is a list of roles that match the user
        // {roles:[],users:[],lastLogin, lastLoggedInUser}
        let is_user_pushed = false;
        for (let i = 0; i < internal_roles.length; i++) {
          if (
            JSON.stringify(...internal_roles[i].roles) ==
            JSON.stringify(...user.userCredentials.userRoles)
          ) {
            internal_roles[i].users.push(user);
            internal_roles[i].lastLogin = timeAgo(
              findLastLogin(internal_roles[i].users)?.getTime()
            );
            internal_roles[i].lastLoggedInUser = findLastLoginUser(
              internal_roles[i].users
            );
            is_user_pushed = true;
            break;
          }
        }

        if (!is_user_pushed) {
          internal_roles.push({
            roles: [...user?.userCredentials?.userRoles],
            users: [user],
            lastLogin: timeAgo(
              new Date(user.userCredentials?.lastLogin ?? 0)?.getTime()
            ),
            lastLoggedInUser: user,
          });
        }
      }
      setRoles(internal_roles);

      if (lastUser && userActivityCountView)
        engine
          .query({
            userActivityLog: userActivityLog.userActivity({
              id: userActivityCountView,
              username: lastUser?.userCredentials?.username,
            }),
          })
          .then((data) => {
            setFrequency(data?.userActivityLog?.listGrid?.rows[0]);
          });
    }
  };

  const { loading, error, data, refetch } = useDataQuery(
    {
      orgUnits: UsersQuery.orgUnitUsers({ orgUnit: orgunit }),
    },
    {
      variables: { orgunit },
      onComplete: handelLoadComplete,
    }
  );

  const selectUser = (e) => {
    if (lastLoginUser) {
      showUserActivity(lastLoginUser);
    }
    if (roles?.length > 0) {
      showRolesChart(roles);
    }

    if (lastLoginUser || roles?.length > 0) setSelectedRow(orgunit.id);
  };

  return (
    <>
      <DataTableRow key={orgunit?.id} selected={orgunit?.id == selectedRow}>
        <DataTableCell
          key={orgunit?.id + "4"}
          colSpan={roles.count}
          onClick={selectUser}
        >
          {orgunit.displayName}
        </DataTableCell>
        <DataTableCell key={orgunit?.id + "1"} onClick={selectUser}>
          *
        </DataTableCell>
        <DataTableCell key={orgunit?.id + "2"} onClick={selectUser}>
          {loading ? <CircularLoader small /> : data?.orgUnits?.pager?.total}
        </DataTableCell>
        <DataTableCell key={orgunit?.id + "3"} onClick={selectUser}>
          <Tooltip content={lastLoginUser?.userCredentials?.lastLogin}>
            {" "}
            {lastLogin}{" "}
          </Tooltip>
        </DataTableCell>

        <DataTableCell key={orgunit?.id + "5"} onClick={selectUser}>
          {frequency}
        </DataTableCell>
      </DataTableRow>
      {roles.map((role, index) => (
        <DataTableRow
          key={orgunit?.id + "rows" + index}
          selected={selectedRow == orgunit?.id + "rows" + index}
        >
          <DataTableCell
            key={orgunit?.id + "rows" + index + "4"}
            onClick={() => {
              if (role?.lastLoggedInUser) {
                showUserActivity(role?.lastLoggedInUser);
              }
              if (roles?.length > 0) {
                showRolesChart(roles);
              }
              if (role?.lastLoggedInUser || roles?.length > 0)
                setSelectedRow(orgunit?.id + "rows" + index);
            }}
          ></DataTableCell>
          <DataTableCell
            key={orgunit?.id + "rows" + index + "1"}
            onClick={() => {
              if (role?.lastLoggedInUser) {
                showUserActivity(role?.lastLoggedInUser);
              }
              if (roles?.length > 0) {
                showRolesChart(roles);
              }

              if (role?.lastLoggedInUser || roles?.length > 0)
                setSelectedRow(orgunit?.id + "rows" + index);
            }}
          >
            {role.roles.map((e) => (
              <Chip key={e.id}>{e.displayName}</Chip>
            ))}
          </DataTableCell>
          <DataTableCell
            key={orgunit?.id + "rows" + index + "2"}
            onClick={() => {
              if (role?.lastLoggedInUser) {
                showUserActivity(role?.lastLoggedInUser);
              }
              if (roles?.length > 0) {
                showRolesChart(roles);
              }

              if (role?.lastLoggedInUser || roles?.length > 0)
                setSelectedRow(orgunit?.id + "rows" + index);
            }}
          >
            {loading ? <CircularLoader small /> : role.users.length}
          </DataTableCell>
          <DataTableCell
            key={orgunit?.id + "rows" + index + "3"}
            onClick={() => {
              console.log(role, "here");
              if (role?.lastLoggedInUser) {
                showUserActivity(role?.lastLoggedInUser);
              }
              if (roles?.length > 0) {
                showRolesChart(roles);
              }

              if (role?.lastLoggedInUser || roles?.length > 0)
                setSelectedRow(orgunit.id + role.roles.toString());
            }}
          >
            <Tooltip
              content={role?.lastLoggedInUser?.userCredentials?.lastLogin}
            >
              {" "}
              {role.lastLogin}{" "}
            </Tooltip>
          </DataTableCell>
          <DataTableCell
            key={orgunit?.id + "rows" + index + "5"}
            onClick={() => {
              if (role?.lastLoggedInUser) {
                showUserActivity(role?.lastLoggedInUser);
              }
              if (roles?.length > 0) {
                showRolesChart(roles);
              }

              if (role?.lastLoggedInUser || roles?.length > 0)
                setSelectedRow(orgunit.id + role.roles.toString());
            }}
          >
            {role.frequency}
          </DataTableCell>
        </DataTableRow>
      ))}
    </>
  );
};

export default DataElementRow;

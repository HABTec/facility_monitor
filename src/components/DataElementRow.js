import React from "react";
import { DataTableRow, DataTableCell, CircularLoader } from "@dhis2/ui";
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

      data?.orgUnits?.users?.forEach(async function (user) {
        user?.userCredentials?.userRoles.forEach((userRole) => {
          // check if the role already exists
          let role = internal_roles.find((e) => e.id == userRole.id);
          if (!role) {
            internal_roles.push({
              ...userRole,
              users: [user],
              lastLogin: timeAgo(
                new Date(user.userCredentials?.lastLogin ?? 0)?.getTime()
              ),
              lastLoggedInUser: user,
            });
          } else {
            let index = internal_roles.indexOf(role);
            role.users.push(user);
            role.lastLogin = timeAgo(findLastLogin(role.users)?.getTime());
            role.lastLoggedInUser = user;
            // internal_roles = [...(roles.filter(e=>e.id!=role.id)),role];
            internal_roles.splice(index, 1);
            internal_roles.push(role);
          }
        });
      });

      // for(let i=0;i<internal_roles.length;i++){
      //   engine
      //     .query({
      //       userActivityLog: userActivityLog.userActivity({
      //         id: userActivityView,
      //         username: internal_roles[i].lastLoggedInUser?.username,
      //       }),
      //     })
      //     .then((data) => {
      //       internal_roles[i].frequency=data?.userActivityLog?.pager?.total;
      //     });
      // }

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
            setFrequency(data?.userActivityLog?.pager?.total);
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
  };

  return (
    <>
      <DataTableRow
        key={orgunit?.id}
        selected={
          lastLoginUser
            ? lastLoginUser?.userCredentials?.username ==
              selectedUser?.userCredentials?.username
            : false
        }
      >
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
          {lastLogin}
        </DataTableCell>

        <DataTableCell key={orgunit?.id + "5"} onClick={selectUser}>
          {frequency}
        </DataTableCell>
      </DataTableRow>
      {roles.map((role) => (
        <DataTableRow
          key={orgunit?.id + role.id}
          selected={
            role.lastLoggedInUser
              ? role.lastLoggedInUser?.userCredentials?.username ==
                selectedUser?.userCredentials?.username
              : false
          }
        >
          <DataTableCell
            key={orgunit?.id + role.id + "4"}
            onClick={() => {
              if (role?.lastLoggedInUser) {
                showUserActivity(role?.lastLoggedInUser);
              }
              if (roles?.length > 0) {
                showRolesChart(roles);
              }
            }}
          ></DataTableCell>
          <DataTableCell
            key={orgunit?.id + role.id + "1"}
            onClick={() => {
              if (role?.lastLoggedInUser) {
                showUserActivity(role?.lastLoggedInUser);
              }
              if (roles?.length > 0) {
                showRolesChart(roles);
              }
            }}
          >
            {role.displayName}
          </DataTableCell>
          <DataTableCell
            key={orgunit?.id + role.id + "2"}
            onClick={() => {
              if (role?.lastLoggedInUser) {
                showUserActivity(role?.lastLoggedInUser);
              }
              if (roles?.length > 0) {
                showRolesChart(roles);
              }
            }}
          >
            {loading ? <CircularLoader small /> : role.users.length}
          </DataTableCell>
          <DataTableCell
            key={orgunit?.id + role.id + "3"}
            onClick={() => {
              if (role?.lastLoggedInUser) {
                showUserActivity(role?.lastLoggedInUser);
              }
              if (roles?.length > 0) {
                showRolesChart(roles);
              }
            }}
          >
            {role.lastLogin}
          </DataTableCell>
          <DataTableCell
            key={orgunit?.id + role.id + "5"}
            onClick={() => {
              if (role?.lastLoggedInUser) {
                showUserActivity(role?.lastLoggedInUser);
              }
              if (roles?.length > 0) {
                showRolesChart(roles);
              }
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

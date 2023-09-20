import React from "react";
import {
  StackedTable,
  spacers,
  StackedTableHead,
  StackedTableCellHead,
  StackedTableBody,
  StackedTableRow,
  StackedTableRowHead,
  StackedTableCell,
  CircularLoader,
  Tooltip,
} from "@dhis2/ui";
import { useState, useEffect } from "react";
import { useDataQuery, useDataEngine } from "@dhis2/app-runtime";
import moment from "moment";

const UsersQuery = {
  orgUnitUsers: ({ orgUnit }) => ({
    resource: `users`,
    params: {
      fields: ["id", "name", "userCredentials[username,disabled,lastLogin]"],
      filter: [
        `organisationUnits.id:eq:${orgUnit?.id}`,
        `userCredentials.disabled:eq:false`,
      ],
      total: true,
      paging: true,
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

const OrgunitWidget = ({ orgunit }) => {
  const engine = useDataEngine();
  const [lastLogin, setLastLogin] = useState(null);
  const [userCount, setUserCount] = useState(null);
  const handelLoadComplete = (data) => {
    // count all the users
    if (data?.orgUnits?.pager?.total > 0) {
      setLastLogin(timeAgo(findLastLogin(data?.orgUnits?.users)?.getTime()));
    }

    setUserCount(data?.orgUnits?.pager?.total);
  };

  useEffect(() => {
    engine
      .query({
        orgUnits: UsersQuery.orgUnitUsers({ orgUnit: orgunit }),
      })
      .then(handelLoadComplete);
  }, [orgunit?.id]);

  const userCountHelpMessage =
    "Number of users assigned to the '" + orgunit.displayName + "' Orgunit";
    const childrenHelpMessage = "Child Orgunit count that directly under '"+orgunit.displayName+"'";
    const lastActive = "The last active time of users who are assigned to '"+orgunit.displayName+"'";

  return (
    <div
      style={{
        marginTop: spacers.dp24,
        marginRight: "auto",
        minWidth: spacers.dp384,
      }}
    >
      <StackedTable>
        <StackedTableHead>
          <StackedTableRowHead>
            <StackedTableCellHead>Selected Orgunit</StackedTableCellHead>
            <StackedTableCellHead>User Count</StackedTableCellHead>
            <StackedTableCellHead>Children</StackedTableCellHead>
            <StackedTableCellHead>Last Active</StackedTableCellHead>
          </StackedTableRowHead>
        </StackedTableHead>
        <StackedTableBody>
          <StackedTableRow>
            <StackedTableCell> <Tooltip content="Currently selected Orgunit">{orgunit.displayName}</Tooltip></StackedTableCell>
            <StackedTableCell>
              <Tooltip content={userCountHelpMessage}>{userCount}</Tooltip>
            </StackedTableCell>
            <StackedTableCell><Tooltip content={childrenHelpMessage}>{orgunit.children}</Tooltip></StackedTableCell>
            <StackedTableCell><Tooltip content={lastActive}>{lastLogin}</Tooltip></StackedTableCell>
          </StackedTableRow>
        </StackedTableBody>
      </StackedTable>
    </div>
  );
};

export default OrgunitWidget;

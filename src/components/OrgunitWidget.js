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
            <StackedTableCellHead>Selected Orgunits</StackedTableCellHead>
            <StackedTableCellHead>User Count</StackedTableCellHead>
            <StackedTableCellHead>Children</StackedTableCellHead>
            <StackedTableCellHead>Last Active</StackedTableCellHead>
          </StackedTableRowHead>
        </StackedTableHead>
        <StackedTableBody>
          <StackedTableRow>
            <StackedTableCell>{orgunit.displayName}</StackedTableCell>
            <StackedTableCell>{userCount}</StackedTableCell>
            <StackedTableCell>{orgunit.children}</StackedTableCell>
            <StackedTableCell>{lastLogin}</StackedTableCell>
          </StackedTableRow>
        </StackedTableBody>
      </StackedTable>
    </div>
  );
};

export default OrgunitWidget;

import React from "react";
import { StackedTable,spacers,StackedTableHead,StackedTableCellHead,StackedTableBody,StackedTableRow, StackedTableRowHead,StackedTableCell, CircularLoader } from "@dhis2/ui";
import { useState, useEffect } from "react";
import { useDataQuery, useDataEngine } from "@dhis2/app-runtime";


const UsersQuery = {
  orgUnitUsers: ({ orgUnit}) => ({
    resource: `users`,
    params: {
      fields: ["id","displayName","userCredentials[username,disabled,lastLogin]"],
      filter: [`organisationUnits.id:eq:${orgUnit?.id}`,`userCredentials.disabled:eq:false`],
      total: true,
      paging:true,
    },
  }),
};

const timeAgo = (prevDate) => {
  const diff = Number(new Date()) - prevDate;
  const minute = 60 * 1000;
  const hour = minute * 60;
  const day = hour * 24;
  const month = day * 30;
  const year = day * 365;
  switch (true) {
      case diff < minute:
          const seconds = Math.round(diff / 1000);
           return `${seconds} ${seconds > 1 ? 'seconds' : 'second'} ago`
      case diff < hour:
          return Math.round(diff / minute) + ' minutes ago';
      case diff < day:
          return Math.round(diff / hour) + ' hours ago';
      case diff < month:
          return Math.round(diff / day) + ' days ago';
      case diff < year:
          return Math.round(diff / month) + ' months ago';
      case diff > year:
          return Math.round(diff / year) + ' years ago';
      default:
          return "";
  }
}
const findLastLogin = (users)=>{
    var maxPeriod = undefined;
    users.forEach((user)=>{
      var user_login_date =  new Date(user.userCredentials?.lastLogin ?? 0);
      if(maxPeriod==undefined){
        maxPeriod = user_login_date;
      }else{
        if(maxPeriod<user_login_date)
          maxPeriod = user_login_date;
      }
    });
    return maxPeriod; 
}

const OrgunitWidget = ({
  orgunit
}) => {
  const engine = useDataEngine();
  const [lastLogin,setLastLogin] = useState(null);
  const [userCount, setUserCount] = useState(null);
  const handelLoadComplete = (data)=>{
        // count all the users
        if(data?.orgUnits?.pager?.total>0){
          setLastLogin(timeAgo(findLastLogin(data?.orgUnits?.users)?.getTime()));
        }

        setUserCount(data?.orgUnits?.pager?.total);
  }

  useEffect(() => {
      engine
        .query({
          orgUnits: UsersQuery.orgUnitUsers({orgUnit:orgunit}),
        })
        .then(handelLoadComplete);
  }, [orgunit?.id]);

  console.log(orgunit,"from the widget");
  // const { loading, error, data, refetch } = useDataQuery(
  //   {
  //     orgUnits: UsersQuery.orgUnitUsers({orgUnit:orgunit}),
  //   },
  //   {
  //     variables: { orgunit },
  //     onComplete: handelLoadComplete,
  //   }
  // );

  // useEffect(() => {
  //   refetch();
  // }, [orgunit?.id]);

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
                    <StackedTableCellHead>
                        Selected Orgunits
                    </StackedTableCellHead>
                    <StackedTableCellHead>
                        User Count
                    </StackedTableCellHead>
                    <StackedTableCellHead>
                        Children
                    </StackedTableCellHead>
                    <StackedTableCellHead>
                        Last Active
                    </StackedTableCellHead>
                </StackedTableRowHead>
            </StackedTableHead>
            <StackedTableBody>
                <StackedTableRow>
                    <StackedTableCell>
                      {orgunit.displayName}
                    </StackedTableCell>
                    <StackedTableCell>
                          {userCount}
                    </StackedTableCell>
                    <StackedTableCell>
                          {orgunit.children}
                    </StackedTableCell>
                    <StackedTableCell>
                      { lastLogin }
                    </StackedTableCell>
                </StackedTableRow>
            </StackedTableBody>
        </StackedTable>
    </div>
  );
};

export default OrgunitWidget;

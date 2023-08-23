import React from "react";
import { DataTableRow, DataTableCell, CircularLoader } from "@dhis2/ui";
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

const DataElementRow = ({
  orgunit
}) => {

  const [lastLogin,setLastLogin] = useState(null);
  const handelLoadComplete = (data)=>{
        // count all the users
        if(data?.orgUnits?.pager?.total>0){
          setLastLogin(timeAgo(findLastLogin(data?.orgUnits?.users)?.getTime()));
        }
  }

  const { loading, error, data, refetch } = useDataQuery(
    {
      orgUnits: UsersQuery.orgUnitUsers({orgUnit:orgunit}),
    },
    {
      variables: { orgunit },
      onComplete: handelLoadComplete,
    }
  );

  return (
    <>
        <DataTableRow key={orgunit?.id}>
          <DataTableCell key={orgunit?.id + "1"}>
            {orgunit.displayName}
          </DataTableCell>
        <DataTableCell key={orgunit?.id + "2"}>
          {loading ? <CircularLoader small /> :
              data?.orgUnits?.pager?.total
          }
          </DataTableCell>
          <DataTableCell key={orgunit?.id + "3"}>
            { lastLogin }
          </DataTableCell>
        </DataTableRow>
    </>
  );
};

export default DataElementRow;

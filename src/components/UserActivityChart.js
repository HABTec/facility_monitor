import React from "react";
import { DataTableRow, DataTableCell, CircularLoader, Card } from "@dhis2/ui";
import { useState, useEffect } from "react";
import { useDataQuery, useDataEngine } from "@dhis2/app-runtime";
import { Line } from "react-chartjs-2";
// import Chart from 'chart.js/auto';
import moment from "moment";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const userActivityLog = {
  userActivity: ({ id, username }) => ({
    resource: `sqlViews`,
    id: `${id}/data.json`,
    params: {
      fields: ["id", "displayName"],
      var: [`username:${username}`],
      paging: false,
    },
  }),
};

const UserActivityChart = ({ user, userActivityView }) => {
  const engine = useDataEngine();
  const [state, setState] = useState();

  const handelLoadComplete = (data) => {
    
    let daysInMonth = Array.from({ length: moment().daysInMonth() }, (x, i) => i+1);
    let line_data = Array.from(daysInMonth, (x, i) => 0);
    let rows = data?.userActivityLog?.listGrid?.rows;
    for (let i = 0; i < rows?.length; i++) {
      line_data[parseInt(rows[i][2])]=parseInt(rows[i][3]);      
    }


    console.log(data,line_data);

    setState({
      data: {
        labels: daysInMonth,
        datasets: [
          {
            data: line_data,
            fill: true,
            borderColor: 'rgb(0, 105, 92)',
            tension: 0.2
          },
        ],
      },
    });

  };


useEffect(()=>{
  if(user)
    engine
    .query({
      userActivityLog: userActivityLog.userActivity({
        id: userActivityView,
        username: user?.username,
      }),
    })
    .then(handelLoadComplete);
},[user]);

  const options = {
    responsive: true,
    scales: {
      y: {
          beginAtZero: true,
          title:{
          display:true,
          text:'Number of Activities',
        }
      },
      x:{
        title:{
          display:true,
          text:'Day of Month',
        }
      }
    },
    plugins: {
      legend: {
        position: "bottom",
        display: false,
      },
      title: {
        display: true,
        text: "User activities during the month",
      },
    },
  };

  return (
    <div> {state? 
      <Card>
        <div style={{ padding: "2%" }}>
          <Line type="line" data={state.data} options={options} />
        </div>
      </Card>
       : <></>
       }
    </div>
  );
};

export default UserActivityChart;

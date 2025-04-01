import React, { useEffect, useState } from "react";
import { fetchDashboardData } from "../utils/api";
import { CircularProgress } from "@mui/material";
import { BarChart, PieChart } from "@mui/x-charts";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchDashboardData();
      setDashboardData(data);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  if (!dashboardData) {
    return <div>Error loading data</div>;
  }

  // Ensure data is not undefined
  const labOccupancyData = dashboardData.labOccupancy || [];
  const userSessionsData = dashboardData.userSessions || [];

  return (
    <div>
      <h2>Lab Occupancy</h2>
      {labOccupancyData.length > 0 ? (
        <BarChart
          dataset={labOccupancyData}
          xAxis={[{ scaleType: "band", dataKey: "hour" }]}
          series={[{ dataKey: "count" }]}
          width={500}
          height={300}
        />
      ) : (
        <p>No lab occupancy data available.</p>
      )}

      <h2>User Sessions</h2>
      {userSessionsData.length > 0 ? (
        <PieChart
          series={[
            {
              data: userSessionsData.map((user) => ({
                id: user.rfid_uid,
                value: user.total_time_spent,
                label: user.rfid_uid,
              })),
            },
          ]}
          width={400}
          height={300}
        />
      ) : (
        <p>No user session data available.</p>
      )}
    </div>
  );
};

export default Dashboard;

import React, { useEffect, useState } from "react";
import { fetchDashboardData } from "../utils/api";
import { CircularProgress, Box, Container, Typography } from "@mui/material";
import { BarChart, PieChart } from "@mui/x-charts";
import Sidebar from "../components/Sidebar";

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
    <Box sx={{ display: "flex", backgroundColor: "#f5f6fa", minHeight: "100vh" }}>
      <Sidebar />
      <Container sx={{ padding: 3, flexGrow: 1, marginLeft: "240px" }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>

        <Typography variant="h5" gutterBottom>
          Lab Occupancy
        </Typography>
        {labOccupancyData.length > 0 ? (
          <BarChart
            dataset={labOccupancyData}
            xAxis={[{ scaleType: "band", dataKey: "hour" }]}
            series={[{ dataKey: "count" }]}
            width={500}
            height={300}
          />
        ) : (
          <Typography>No lab occupancy data available.</Typography>
        )}

        <Typography variant="h5" gutterBottom sx={{ marginTop: 4 }}>
          User Sessions
        </Typography>
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
          <Typography>No user session data available.</Typography>
        )}
      </Container>
    </Box>
  );
};

export default Dashboard;
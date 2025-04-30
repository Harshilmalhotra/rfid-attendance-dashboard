import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { fetchWeeklyOccupancy } from "../utils/api"; // Import the fetch function

export default function WeeklyOccupancyChart({ className }) {
  const [weekData, setWeekData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetchWeeklyOccupancy();
        console.log("Fetched data:", data);  // Log the data received
        if (Array.isArray(data)) {
          const formattedData = data.map((item) => ({
            day: item.date,  // Using the full date from the API
            users: item.occupancy_count,  // Using occupancy_count for the count
          }));
          setWeekData(formattedData);
        } else {
          throw new Error("Invalid data format");
        }
      } catch (err) {
        setError("Failed to fetch weekly occupancy data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Get the last 7 days (using the "YYYY-MM-DD" format)
  const getLastSevenDays = () => {
    const today = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      days.push(date.toLocaleDateString("en-CA")); // Use ISO format "YYYY-MM-DD"
    }
    return days;
  };

  // If data is still loading
  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  // If there was an error fetching data
  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  // If there's no valid data
  if (!Array.isArray(weekData) || weekData.length === 0) {
    return <Typography color="error">No data available for weekly occupancy</Typography>;
  }

  // Get the last 7 days
  const labels = getLastSevenDays();
  const chartData = labels.map((label, index) => {
    const dataPoint = weekData.find((item) => item.day === label);
    return {
      day: label,
      users: dataPoint ? dataPoint.users : 0, // Use 0 if no data for the specific day
    };
  });

  return (
    <Card className={className}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Weekly Occupancy
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="users" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

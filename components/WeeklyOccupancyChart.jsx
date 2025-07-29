import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { fetchWeeklyOccupancy } from "@/utils/api";

export default function WeeklyOccupancyChart({ className }) {
  const [weekData, setWeekData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await fetchWeeklyOccupancy();
        if (Array.isArray(data)) {
          const formattedData = data.map((item) => ({
            day: item.date,
            users: item.occupancy_count,
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

  const getLastSevenDays = () => {
    const today = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      days.push(date.toLocaleDateString("en-CA"));
    }
    return days;
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!Array.isArray(weekData) || weekData.length === 0)
    return <Typography color="error">No data available for weekly occupancy</Typography>;

  const labels = getLastSevenDays();
  const chartData = labels.map((label) => {
    const dataPoint = weekData.find((item) => item.day === label);
    return {
      day: label,
      users: dataPoint ? dataPoint.users : 0,
    };
  });

  const colors = ["#37c85c", "#ffb42e", "#ff6966", "#4a90e4"];

  return (
    <Card className={className}>
      <CardContent style={{ backgroundColor: '#f4f6fa' }}>
        <Typography variant="h6" gutterBottom>
          Weekly Occupancy
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="users">
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

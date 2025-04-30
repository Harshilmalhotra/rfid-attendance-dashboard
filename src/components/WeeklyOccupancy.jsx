import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function WeeklyOccupancyChart({ className }) {
  const weekData = [
    { day: "Mon", users: 10 },
    { day: "Tue", users: 20 },
    { day: "Wed", users: 15 },
    { day: "Thu", users: 30 },
    { day: "Fri", users: 25 },
    { day: "Sat", users: 8 },
    { day: "Sun", users: 5 },
  ];

  if (!Array.isArray(weekData)) {
    return <Typography color="error">Invalid week data</Typography>;
  }

  return (
    <Card className={className}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Weekly Occupancy
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weekData}>
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

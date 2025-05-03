import { useEffect, useState } from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { Gauge } from "@mui/x-charts/Gauge";
import { motion } from "framer-motion";
import { fetchCurrentOccupants } from "../utils/api";

export default function LabUsageGauge() {
  const [occupancy, setOccupancy] = useState(0);
  const maxCapacity = 20; // You can update this based on your lab size

  useEffect(() => {
    async function getOccupancy() {
      try {
        const data = await fetchCurrentOccupants();
        setOccupancy(data.count || 0);
      } catch (err) {
        console.error("Failed to fetch current occupancy:", err);
      }
    }

    getOccupancy();
  }, []);

  return (
    <motion.div whileHover={{ scale: 1.02 }}>
      <Card
        sx={{
          width: { xs: "100%", sm: "300px" }, // Responsive width
          height: { xs: "100%", sm: "300px" }, // Responsive height
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f4f6fa", // Background color
          borderRadius: 2,
          boxShadow: 2,
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            width: "100%",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Current Lab Occupancy
          </Typography>
          <Gauge
            value={occupancy}
            valueMin={0}
            valueMax={maxCapacity}
            width={200}
            height={200}
            sx={{
              "& .MuiGauge-root": {
                color: "#37c85c", // Apply the custom color
              },
            }}
            series={[
              {
                data: [{ value: occupancy }],
                color: "#37c85c", // Set the gauge color
              },
            ]}
          />
          <Typography align="center" variant="body2" sx={{ marginTop: 1 }}>
            {occupancy} / {maxCapacity} people
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
}
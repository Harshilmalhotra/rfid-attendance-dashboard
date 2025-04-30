import { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Container,
  useTheme,
  useMediaQuery,
  Skeleton,
} from "@mui/material";
import { motion } from "framer-motion";
import OccupantsCard from "../components/OccupantsCard";
import LabUsageGauge from "../components/LabUsageGauge";
import WeeklyOccupancyChart from "../components/WeeklyOccupancyChart";
import RushHoursChart from "../components/RushHoursChart";

export default function Dashboard() {
  const theme = useTheme();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.default,
        minHeight: "100vh",
        display: "flex",
      }}
    >
      <Container
        sx={{
          padding: theme.spacing(3),
          flexGrow: 1,
          marginLeft: isDesktop ? "60px" : 0, // consistent left margin with AttendanceLog
          transition: "margin-left 0.3s ease",
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <Typography
            variant="h4"
            gutterBottom
            sx={{ color: theme.palette.primary.main, pb: 2 }}
          >
            Lab Analytics Dashboard
          </Typography>

          <Box
            className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full"
            sx={{ maxWidth: "100%" }}
          >
            {loading ? (
              <Skeleton variant="rectangular" height={250} />
            ) : (
              <Box className="rounded-xl shadow-md p-4 bg-white dark:bg-gray-900">
                <OccupantsCard />
              </Box>
            )}

            {loading ? (
              <Skeleton variant="rectangular" height={250} />
            ) : (
              <Box className="rounded-xl shadow-md p-4 bg-white dark:bg-gray-900">
                <LabUsageGauge />
              </Box>
            )}

            {loading ? (
              <Skeleton
                variant="rectangular"
                height={300}
                className="col-span-1 md:col-span-2"
              />
            ) : (
              <Box className="rounded-xl shadow-md p-4 bg-white dark:bg-gray-900 col-span-1 md:col-span-2">
                <WeeklyOccupancyChart />
              </Box>
            )}

            {loading ? (
              <Skeleton variant="rectangular" height={250} />
            ) : (
              <Box className="rounded-xl shadow-md p-4 bg-white dark:bg-gray-900">
                <RushHoursChart />
              </Box>
            )}
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}

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
        padding: theme.spacing(3),
      }}
    >
      <Container
        sx={{
          flexGrow: 1,
          marginLeft: isDesktop ? "60px" : 0,
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
            sx={{ color: theme.palette.primary.main, pb: 3 }}
          >
            Lab Analytics Dashboard
          </Typography>

          {/* OccupantsCard - full width */}
          {loading ? (
            <Skeleton variant="rectangular" height={250} sx={{ mb: 4 }} />
          ) : (
            <Box
              sx={{
                borderRadius: 2,
                boxShadow: 3,
                p: 3,
                backgroundColor: theme.palette.background.paper,
                mb: 4,
              }}
            >
              <OccupantsCard />
            </Box>
          )}

          {/* LabUsageGauge + RushHoursChart - side-by-side on desktop */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
              mb: 4,
            }}
          >
            {loading ? (
              <Skeleton variant="rectangular" height={250} sx={{ flex: 1 }} />
            ) : (
              <Box
                sx={{
                  flex: 1,
                  borderRadius: 2,
                  boxShadow: 3,
                  p: 3,
                  backgroundColor: theme.palette.background.paper,
                }}
              >
                <LabUsageGauge />
              </Box>
            )}

            {loading ? (
              <Skeleton variant="rectangular" height={250} sx={{ flex: 1 }} />
            ) : (
              <Box
                sx={{
                  flex: 1,
                  borderRadius: 2,
                  boxShadow: 3,
                  p: 3,
                  backgroundColor: theme.palette.background.paper,
                }}
              >
                <RushHoursChart />
              </Box>
            )}
          </Box>

          {/* WeeklyOccupancyChart - full width */}
          {loading ? (
            <Skeleton variant="rectangular" height={300} />
          ) : (
            <Box
              sx={{
                borderRadius: 2,
                boxShadow: 3,
                p: 3,
                backgroundColor: theme.palette.background.paper,
              }}
            >
              <WeeklyOccupancyChart />
            </Box>
          )}
        </motion.div>
      </Container>
    </Box>
  );
}

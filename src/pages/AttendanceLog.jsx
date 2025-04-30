import React, { useState, useEffect } from "react";
import { fetchAttendanceLogs } from "../utils/api.js";  // Import the fetch function from utils
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  useTheme,
  useMediaQuery,
  TableSortLabel,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import Sidebar from "../components/Sidebar";
import Chip from "@mui/material/Chip";

dayjs.extend(utc);
dayjs.extend(timezone);

const AttendanceLog = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery("(min-width: 600px)");
  const [date, setDate] = useState(dayjs());
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ column: "created_at", order: "asc" });

  useEffect(() => {
    if (date) fetchLogs();
  }, [date, sortConfig]);

  const fetchLogs = async () => {
    if (!date) return;
    setLoading(true);
    try {
      const startOfDayUTC = dayjs(date).tz("Asia/Kolkata").startOf("day").toISOString();
      const endOfDayUTC = dayjs(date).tz("Asia/Kolkata").endOf("day").toISOString();

      // Fetch the attendance logs from the API
      const data = await fetchAttendanceLogs(startOfDayUTC, endOfDayUTC);

      // Process the data
      const logsIST = data.map((log) => ({
        ...log,
        timestamp: dayjs(log.created_at).format("DD/MM/YYYY HH:mm:ss"),
      }));

      setLogs(logsIST);
    } catch (error) {
      console.error("Error fetching logs:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column) => {
    setSortConfig((prev) => ({
      column,
      order: prev.column === column && prev.order === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <Box sx={{ display: "flex", backgroundColor: theme.palette.background.default, minHeight: "100vh" }}>
      {/* <Sidebar /> */}
      <Container
        sx={{
          padding: theme.spacing(3),
          flexGrow: 1,
          marginLeft: isDesktop ? "240px" : 0,
          transition: "margin-left 0.3s ease",
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ color: theme.palette.primary.main }}>
          Attendance Log
        </Typography>
        <Box sx={{ marginBottom: theme.spacing(2), display: "flex", justifyContent: "space-between" }}>
          <DatePicker
            label="Select Date"
            value={date}
            onChange={setDate}
            format="DD/MM/YYYY"
            renderInput={(params) => (
              <Paper
                elevation={3}
                sx={{
                  padding: theme.spacing(1),
                  display: "inline-flex",
                  alignItems: "center",
                  width: "250px",
                }}
              >
                {params.input}
              </Paper>
            )}
          />
        </Box>
        <TableContainer component={Paper} elevation={3} sx={{ marginTop: theme.spacing(2) }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{ fontWeight: "bold", backgroundColor: theme.palette.primary.light, color: theme.palette.primary.contrastText }}
                >
                  <TableSortLabel
                    active={sortConfig.column === "users.name"}
                    direction={sortConfig.column === "users.name" ? sortConfig.order : "asc"}
                    onClick={() => handleSort("users.name")}
                  >
                    Name
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", backgroundColor: theme.palette.primary.light, color: theme.palette.primary.contrastText }}
                >
                  <TableSortLabel
                    active={sortConfig.column === "rfid_uid"}
                    direction={sortConfig.column === "rfid_uid" ? sortConfig.order : "asc"}
                    onClick={() => handleSort("rfid_uid")}
                  >
                    RFID
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", backgroundColor: theme.palette.primary.light, color: theme.palette.primary.contrastText }}
                >
                  <TableSortLabel
                    active={sortConfig.column === "status"}
                    direction={sortConfig.column === "status" ? sortConfig.order : "asc"}
                    onClick={() => handleSort("status")}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", backgroundColor: theme.palette.primary.light, color: theme.palette.primary.contrastText }}
                >
                  <TableSortLabel
                    active={sortConfig.column === "timestamp"}
                    direction={sortConfig.column === "timestamp" ? sortConfig.order : "asc"}
                    onClick={() => handleSort("timestamp")}
                  >
                    Timestamp
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : logs.length > 0 ? (
                logs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>{log.users?.name || "Unknown"}</TableCell>
                    <TableCell>{log.rfid_uid}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={log.status === "IN" ? "success" : "error"}
                        label={log.status}
                        sx={{
                          fontWeight: "bold",
                          color: log.status === "IN" ? theme.palette.success.contrastText : theme.palette.error.contrastText,
                        }}
                      />
                    </TableCell>
                    <TableCell>{log.timestamp}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No records found for this date.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
};

export default AttendanceLog;

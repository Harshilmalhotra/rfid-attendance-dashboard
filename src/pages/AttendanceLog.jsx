import React, { useState, useEffect } from "react";
import { fetchAttendanceLogs } from "../utils/api.js";
import { supabase } from "../supabaseClient";
import logo from "/logo.png";
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
  Chip,
  Button
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

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

      const data = await fetchAttendanceLogs(startOfDayUTC, endOfDayUTC);

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

  const handlePrint = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    const ip = await fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => data.ip);
    const now = new Date().toLocaleString("en-IN");

    const printContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1, h3 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            img { max-height: 60px; margin-bottom: 10px; }
            .meta { margin-top: 20px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div style="text-align: center;">
            <img src="${window.location.origin}/logo.png" alt="Logo" />
            <h1>ISD Lab Attendance Sheet</h1>
            <h3>Date: ${dayjs(date).format("DD/MM/YYYY")}</h3>
          </div>

          <div class="meta">
            <p><strong>Downloaded by:</strong> ${user?.user_metadata?.first_name || ""} ${user?.user_metadata?.last_name || ""} (${user?.email})</p>
            <p><strong>Print Time:</strong> ${now}</p>
            <p><strong>IP Address:</strong> ${ip}</p>
            <p><strong>Page URL:</strong> ${window.location.href}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>RFID</th>
                <th>Check</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              ${logs
                .map(
                  (log) => `
                    <tr>
                      <td>${log.users?.name || "Unknown"}</td>
                      <td>${log.rfid_uid}</td>
                      <td>${log.Check}</td>
                      <td>${log.timestamp}</td>
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handleSort = (column) => {
    setSortConfig((prev) => ({
      column,
      order: prev.column === column && prev.order === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <Box sx={{ display: "flex", backgroundColor: theme.palette.background.default, minHeight: "100vh" }}>
      <Container
        sx={{
          padding: theme.spacing(3),
          flexGrow: 1,
          marginLeft: isDesktop ? "60px" : 0,
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
              <Paper elevation={3} sx={{ padding: theme.spacing(1), display: "inline-flex", alignItems: "center", width: "250px" }}>
                {params.input}
              </Paper>
            )}
          />
        </Box>

        <Button variant="outlined" onClick={handlePrint}>
          Print Attendance Sheet
        </Button>

        <TableContainer component={Paper} elevation={3} sx={{ marginTop: theme.spacing(2) }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", backgroundColor: theme.palette.primary.light, color: theme.palette.primary.contrastText }}>
                  <TableSortLabel
                    active={sortConfig.column === "users.name"}
                    direction={sortConfig.column === "users.name" ? sortConfig.order : "asc"}
                    onClick={() => handleSort("users.name")}
                  >
                    Name
                  </TableSortLabel>
                </TableCell>

                <TableCell sx={{ fontWeight: "bold", backgroundColor: theme.palette.primary.light, color: theme.palette.primary.contrastText }}>
                  <TableSortLabel
                    active={sortConfig.column === "rfid_uid"}
                    direction={sortConfig.column === "rfid_uid" ? sortConfig.order : "asc"}
                    onClick={() => handleSort("rfid_uid")}
                  >
                    RFID
                  </TableSortLabel>
                </TableCell>

                <TableCell sx={{ fontWeight: "bold", backgroundColor: theme.palette.primary.light, color: theme.palette.primary.contrastText }}>
                  <TableSortLabel
                    active={sortConfig.column === "Check"}
                    direction={sortConfig.column === "Check" ? sortConfig.order : "asc"}
                    onClick={() => handleSort("Check")}
                  >
                    Check
                  </TableSortLabel>
                </TableCell>

                <TableCell sx={{ fontWeight: "bold", backgroundColor: theme.palette.primary.light, color: theme.palette.primary.contrastText }}>
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
                        color={log.Check === "IN" ? "success" : "error"}
                        label={log.Check}
                        sx={{
                          fontWeight: "bold",
                          color: log.Check === "IN" ? theme.palette.success.contrastText : theme.palette.error.contrastText,
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

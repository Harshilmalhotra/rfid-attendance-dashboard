'use client'

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  TextField,
  MenuItem,
  Chip,
  LinearProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Download, FilterList, Today } from "@mui/icons-material";
import dayjs from "dayjs";
import PageWrapper from "@/components/PageWrapper";

export default function AttendanceLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: dayjs().startOf("week"),
    endDate: dayjs().endOf("week"),
    userId: "all",
    status: "all",
  });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchAttendanceLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .order("full_name");

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchAttendanceLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("attendance_logs")
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `)
        .gte("entry_time", filters.startDate.toISOString())
        .lte("entry_time", filters.endDate.toISOString())
        .order("entry_time", { ascending: false });

      if (filters.userId !== "all") {
        query = query.eq("user_id", filters.userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Process the data
      const processedLogs = data?.map((log) => ({
        id: log.id,
        userName: log.profiles?.full_name || "Unknown",
        email: log.profiles?.email || "",
        entryTime: dayjs(log.entry_time).format("MMM DD, YYYY HH:mm"),
        exitTime: log.exit_time
          ? dayjs(log.exit_time).format("MMM DD, YYYY HH:mm")
          : "Still Inside",
        duration: calculateDuration(log.entry_time, log.exit_time),
        status: log.exit_time ? "completed" : "active",
      })) || [];

      if (filters.status !== "all") {
        setLogs(processedLogs.filter((log) => log.status === filters.status));
      } else {
        setLogs(processedLogs);
      }
    } catch (error) {
      console.error("Error fetching attendance logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = (entryTime, exitTime) => {
    if (!exitTime) return "Ongoing";
    
    const duration = dayjs(exitTime).diff(dayjs(entryTime), "minute");
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    return `${hours}h ${minutes}m`;
  };

  const handleExport = () => {
    // Convert logs to CSV
    const headers = ["User Name", "Email", "Entry Time", "Exit Time", "Duration", "Status"];
    const csvData = logs.map((log) => [
      log.userName,
      log.email,
      log.entryTime,
      log.exitTime,
      log.duration,
      log.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_log_${dayjs().format("YYYY-MM-DD")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const columns = [
    {
      field: "userName",
      headerName: "User Name",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "entryTime",
      headerName: "Entry Time",
      flex: 1,
      minWidth: 180,
    },
    {
      field: "exitTime",
      headerName: "Exit Time",
      flex: 1,
      minWidth: 180,
    },
    {
      field: "duration",
      headerName: "Duration",
      width: 120,
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value === "active" ? "Active" : "Completed"}
          color={params.value === "active" ? "success" : "default"}
          size="small"
        />
      ),
    },
  ];

  return (
    <PageWrapper>
      <Box sx={{ width: "100%" }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Typography variant="h4" fontWeight="bold">
            Attendance Log
          </Typography>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleExport}
            disabled={logs.length === 0}
          >
            Export CSV
          </Button>
        </Stack>

        {/* Filters */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Stack spacing={3}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems="center"
            >
              <FilterList color="action" />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Start Date"
                  value={filters.startDate}
                  onChange={(newValue) =>
                    setFilters({ ...filters, startDate: newValue })
                  }
                  slotProps={{ textField: { fullWidth: true } }}
                />
                <DatePicker
                  label="End Date"
                  value={filters.endDate}
                  onChange={(newValue) =>
                    setFilters({ ...filters, endDate: newValue })
                  }
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
              <TextField
                select
                label="User"
                value={filters.userId}
                onChange={(e) =>
                  setFilters({ ...filters, userId: e.target.value })
                }
                fullWidth
              >
                <MenuItem value="all">All Users</MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.full_name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Status"
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                fullWidth
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </TextField>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                startIcon={<Today />}
                onClick={() =>
                  setFilters({
                    ...filters,
                    startDate: dayjs().startOf("day"),
                    endDate: dayjs().endOf("day"),
                  })
                }
              >
                Today
              </Button>
              <Button
                size="small"
                onClick={() =>
                  setFilters({
                    ...filters,
                    startDate: dayjs().startOf("week"),
                    endDate: dayjs().endOf("week"),
                  })
                }
              >
                This Week
              </Button>
              <Button
                size="small"
                onClick={() =>
                  setFilters({
                    ...filters,
                    startDate: dayjs().startOf("month"),
                    endDate: dayjs().endOf("month"),
                  })
                }
              >
                This Month
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Data Grid */}
        <Paper elevation={2} sx={{ height: 600 }}>
          {loading && <LinearProgress />}
          <DataGrid
            rows={logs}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
            loading={loading}
            sx={{
              "& .MuiDataGrid-cell": {
                borderBottom: "1px solid rgba(224, 224, 224, 0.4)",
              },
            }}
          />
        </Paper>
      </Box>
    </PageWrapper>
  );
}
// src\utils\api.js
import axios from "axios";

const API_URL = "http://localhost:3001"; // Make sure the API server is running on this port

// Fetch current people present in the lab
export const fetchCurrentOccupants = async () => {
  const response = await axios.get(`${API_URL}/analytics/current`);
  return response.data;
};

// Fetch weekly lab occupancy data
export const fetchWeeklyOccupancy = async () => {
  const response = await axios.get(`${API_URL}/analytics/weekly`);
  return response.data;
};

// Fetch rush hours data
export const fetchRushHours = async () => {
  const response = await axios.get(`${API_URL}/analytics/rush-hours`);
  return response.data;
};

// Fetch attendance logs for a specific date range
export const fetchAttendanceLogs = async (startDate, endDate) => {
  const response = await axios.get(
    `${API_URL}/api/attendance?start_date=${startDate}&end_date=${endDate}`
  );
  return response.data;
};

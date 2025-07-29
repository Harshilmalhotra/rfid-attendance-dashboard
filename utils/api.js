import axios from "axios";


const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const fetchCurrentOccupants = async () => {
  const response = await axios.get(`${API_URL}/analytics/current`);
  return response.data;
};


export const fetchWeeklyOccupancy = async () => {
  try {
    const response = await axios.get(`${API_URL}/analytics/weekly`);
    return response.data;
  } catch (error) {
    console.error('Error fetching weekly occupancy:', error);
    throw error;
  }
};


export const fetchRushHours = async () => {
  const response = await axios.get(`${API_URL}/analytics/rushhours`);
  return response.data;
};


export const fetchAttendanceLogs = async (startDate, endDate) => {
  const response = await axios.get(
    `${API_URL}/attendance?start_date=${startDate}&end_date=${endDate}`
  );
  return response.data;
};
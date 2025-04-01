import { supabase } from "../supabaseClient";

export async function fetchDashboardData() {
  try {
    console.log("Fetching dashboard data...");

    // Fetch lab occupancy data
    const { data: labOccupancy, error: labOccupancyError } = await supabase
      .from("lab_occupancy")
      .select("*");

    if (labOccupancyError) throw labOccupancyError;
    console.log("Lab Occupancy Data:", labOccupancy);

    // Fetch user session data
    const { data: userSessions, error: userSessionsError } = await supabase
      .from("user_sessions")
      .select("*");

    if (userSessionsError) throw userSessionsError;
    console.log("User Sessions Data:", userSessions);

    return {
      labOccupancy: labOccupancy || [],
      userSessions: userSessions || [],
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error.message);
    return { labOccupancy: [], userSessions: [] };
  }
}
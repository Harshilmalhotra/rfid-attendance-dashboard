import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Container, Typography } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const Profile = ({ userId }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const { data } = await supabase.from("attendance").select("*").eq("rfid_uid", userId);
    setHistory(data);
  };

  return (
    <Container>
      <Typography variant="h4">Profile</Typography>
      <BarChart width={600} height={300} data={history}>
        <XAxis dataKey="timestamp" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="duration" fill="#8884d8" />
      </BarChart>
    </Container>
  );
};

export default Profile;

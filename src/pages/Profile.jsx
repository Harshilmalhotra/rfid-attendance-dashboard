import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Stack,
} from "@mui/material";

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Error fetching user:", error.message);
        setStatus("❌ Error fetching profile.");
      } else {
        console.log("[Profile] ✅ Loaded user:", user.email);
        setUser(user);
        setEmail(user.email || "");
        setFirstName(user.user_metadata?.first_name || "");
        setLastName(user.user_metadata?.last_name || "");
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);

  const updateProfile = async () => {
    setLoading(true);
    setStatus("");

    const updates = {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
      email,
    };

    const { error, data } = await supabase.auth.updateUser(updates);

    if (error) {
      console.error("Error updating profile:", error.message);
      setStatus(`❌ Update failed: ${error.message}`);
    } else {
      console.log("[Profile] ✅ Updated profile:", data.user.email);
      setStatus("✅ Profile updated.");
    }

    setLoading(false);
  };

  const updatePassword = async () => {
    if (!password) return;

    setLoading(true);
    setStatus("");

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      console.error("Error updating password:", error.message);
      setStatus("❌ Password update failed.");
    } else {
      console.log("[Profile] ✅ Password updated.");
      setStatus("✅ Password updated.");
    }

    setPassword("");
    setLoading(false);
  };

  return (
    <Box p={3}>
      <Paper elevation={2} sx={{ p: 4, maxWidth: 600, margin: "0 auto" }}>
        <Typography variant="h5" mb={3}>
          Profile Settings
        </Typography>

        {status && <Typography mb={2}>{status}</Typography>}

        <Stack spacing={2}>
          <TextField
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />

          <Button
            variant="contained"
            onClick={updateProfile}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : "Update Profile"}
          </Button>

          <TextField
            label="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            fullWidth
          />
          <Button
            variant="outlined"
            color="secondary"
            onClick={updatePassword}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : "Update Password"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Profile;

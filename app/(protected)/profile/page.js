'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Avatar,
  Divider,
  Alert,
  InputAdornment,
  IconButton,
  Grid,
  Card,
  CardContent,
  LinearProgress,
} from "@mui/material";
import {
  Edit,
  Save,
  Cancel,
  Person,
  Email,
  Phone,
  Badge,
  CreditCard,
  Business,
  Logout,
  PhotoCamera,
  CalendarMonth,
  AccessTime,
} from "@mui/icons-material";
import PageWrapper from "@/components/PageWrapper";

export default function Profile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    department: "",
    rfid_tag: "",
  });
  const [stats, setStats] = useState({
    totalHours: 0,
    averageHours: 0,
    daysActive: 0,
    lastSeen: null,
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchProfile();
    fetchUserStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFormData({
        full_name: data.full_name || "",
        email: data.email || "",
        phone_number: data.phone_number || "",
        department: data.department || "",
        rfid_tag: data.rfid_tag || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Fetch attendance logs for the user
      const { data: logs, error } = await supabase
        .from("attendance_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("entry_time", { ascending: false });

      if (error) throw error;

      // Calculate stats
      let totalMinutes = 0;
      let daysActive = new Set();
      
      logs?.forEach((log) => {
        if (log.exit_time) {
          const duration = new Date(log.exit_time) - new Date(log.entry_time);
          totalMinutes += duration / (1000 * 60);
        }
        
        const date = new Date(log.entry_time).toDateString();
        daysActive.add(date);
      });

      const totalHours = Math.round(totalMinutes / 60);
      const averageHours = daysActive.size > 0 
        ? Math.round(totalHours / daysActive.size * 10) / 10 
        : 0;

      setStats({
        totalHours,
        averageHours,
        daysActive: daysActive.size,
        lastSeen: logs?.[0]?.entry_time || null,
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone_number: formData.phone_number || null,
          department: formData.department || null,
          rfid_tag: formData.rfid_tag || null,
        })
        .eq("id", user.id);

      if (error) throw error;

      setSuccess("Profile updated successfully!");
      setEditing(false);
      fetchProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  if (loading) {
    return (
      <PageWrapper>
        <LinearProgress />
      </PageWrapper>
    );
  }

  const StatCard = ({ icon, title, value, color = "primary.main" }) => (
    <Card elevation={2}>
      <CardContent>
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ color }}>{icon}</Box>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Stack>
          <Typography variant="h5" fontWeight="bold">
            {value}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <PageWrapper>
      <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto" }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          My Profile
        </Typography>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Profile Information */}
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 4 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 3 }}
              >
                <Typography variant="h6">Profile Information</Typography>
                {!editing ? (
                  <Button
                    startIcon={<Edit />}
                    onClick={() => setEditing(true)}
                    variant="outlined"
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Stack direction="row" spacing={1}>
                    <Button
                      startIcon={<Cancel />}
                      onClick={() => {
                        setEditing(false);
                        setFormData({
                          full_name: profile.full_name || "",
                          email: profile.email || "",
                          phone_number: profile.phone_number || "",
                          department: profile.department || "",
                          rfid_tag: profile.rfid_tag || "",
                        });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      startIcon={<Save />}
                      onClick={handleSave}
                      variant="contained"
                      disabled={saving}
                    >
                      Save
                    </Button>
                  </Stack>
                )}
              </Stack>

              <Stack spacing={3}>
                <Stack direction="row" spacing={3} alignItems="center">
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      bgcolor: "primary.main",
                      fontSize: 40,
                    }}
                  >
                    {formData.full_name?.charAt(0)?.toUpperCase() || "U"}
                  </Avatar>
                  {editing && (
                    <Button
                      variant="outlined"
                      startIcon={<PhotoCamera />}
                      disabled
                    >
                      Change Photo
                    </Button>
                  )}
                </Stack>

                <Divider />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                      disabled={!editing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={formData.email}
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={formData.phone_number}
                      onChange={(e) =>
                        setFormData({ ...formData, phone_number: e.target.value })
                      }
                      disabled={!editing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Department"
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                      disabled={!editing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Business />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="RFID Tag"
                      value={formData.rfid_tag}
                      onChange={(e) =>
                        setFormData({ ...formData, rfid_tag: e.target.value })
                      }
                      disabled={!editing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CreditCard />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Stack>
            </Paper>
          </Grid>

          {/* Stats */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <StatCard
                icon={<AccessTime />}
                title="Total Hours"
                value={`${stats.totalHours}h`}
                color="primary.main"
              />
              <StatCard
                icon={<CalendarMonth />}
                title="Days Active"
                value={stats.daysActive}
                color="success.main"
              />
              <StatCard
                icon={<AccessTime />}
                title="Average Hours/Day"
                value={`${stats.averageHours}h`}
                color="info.main"
              />
              {stats.lastSeen && (
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Last Seen
                    </Typography>
                    <Typography variant="body1">
                      {new Date(stats.lastSeen).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              )}
              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<Logout />}
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </PageWrapper>
  );
}
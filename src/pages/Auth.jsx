import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  CircularProgress,
  InputAdornment,
  IconButton,
  Box,
  Stack,
  Divider,
  Paper,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { motion } from "framer-motion";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authMode, setAuthMode] = useState("signIn"); // "signIn" or "signUp"
  const navigate = useNavigate();

  const handleAuth = async () => {
    setLoading(true);
    setError("");
    try {
      if (authMode === "signIn") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/attendance");
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Check your email to verify your account!");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      alert("Magic link sent to your email!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      alert("Password reset link sent to your email!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #dfe9f3 0%, #ffffff 100%)",
        p: 2,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, width: "100%", maxWidth: 480 }}>
          <Box textAlign="center" mb={3}>
            <img
              src="/logo.png"
              alt="Lab Logo"
              style={{ width: 80, height: 80, marginBottom: 12 }}
            />
            <Typography variant="h5" gutterBottom>
              ISD LAB Attendance App
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {authMode === "signIn"
                ? "Welcome back! Please sign in."
                : "Create a new account to get started."}
            </Typography>
          </Box>

          {error && (
            <Typography color="error" mb={2} textAlign="center">
              {error}
            </Typography>
          )}

          <Stack spacing={2}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
            />
            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={togglePasswordVisibility}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box textAlign="right">
              <Button onClick={handleForgotPassword} size="small">
                Forgot Password?
              </Button>
            </Box>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleAuth}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : authMode === "signIn" ? "Sign In" : "Sign Up"}
            </Button>

            <Divider>or</Divider>

            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              onClick={handleMagicLink}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Send Magic Link"}
            </Button>

            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              {authMode === "signIn" ? (
                <>
                  Don’t have an account?{" "}
                  <Button onClick={() => setAuthMode("signUp")} size="small">
                    Create one
                  </Button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Button onClick={() => setAuthMode("signIn")} size="small">
                    Sign in
                  </Button>
                </>
              )}
            </Typography>
          </Stack>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default Auth;

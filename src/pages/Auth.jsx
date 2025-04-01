import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { Container, TextField, Button, Typography, CircularProgress } from "@mui/material";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async () => {
    setLoading(true);
    setError("");
    console.log("Signing in...");
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      console.log("Signed in:", data);
      navigate("/attendance"); // Redirect after login
    } catch (error) {
      console.error("Sign-in error:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError("");
    console.log("Signing up...");
    
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      console.log("Signed up:", data);
      alert("Check your email to verify your account!");
    } catch (error) {
      console.error("Sign-up error:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" style={{ textAlign: "center", marginTop: "2rem" }}>
      <Typography variant="h4">Attendance App</Typography>
      {error && <Typography color="error">{error}</Typography>}
      <TextField label="Email" fullWidth margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
      <TextField label="Password" type="password" fullWidth margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button variant="contained" color="primary" fullWidth onClick={handleSignIn} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : "Sign In"}
      </Button>
      <Button variant="outlined" color="secondary" fullWidth onClick={handleSignUp} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : "Sign Up"}
      </Button>
    </Container>
  );
};

export default Auth;

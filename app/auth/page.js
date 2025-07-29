'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import Image from "next/image";
import GoogleOneTap from "@/components/GoogleOneTap";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  Container,
  InputAdornment,
  IconButton,
  Alert,
  Stack,
  Divider,
  CircularProgress,
  Fade,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Login,
  PersonAdd,
  Google,
} from "@mui/icons-material";

export default function Auth() {
  const router = useRouter();
  const { user, signIn, signUp, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [oneTapDismissed, setOneTapDismissed] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) throw error;
        setSuccess("Check your email for the confirmation link!");
        setEmail("");
        setPassword("");
      } else {
        const { data, error } = await signIn(email, password);
        if (error) throw error;
        
        // Force redirect if sign-in successful
        if (data?.session) {
          router.push('/dashboard');
          router.refresh(); // Force a refresh to ensure middleware picks up the session
        }
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    setOneTapDismissed(true); // Dismiss One Tap when using button

    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <>
      {/* Google One Tap - only show if not dismissed */}
      {!oneTapDismissed && <GoogleOneTap disabled={isSignUp} />}
      
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ mb: 4, textAlign: "center" }}>
              <Box sx={{ position: 'relative', width: 120, height: 120, mx: 'auto', mb: 2 }}>
                <Image
                  src={process.env.NEXT_PUBLIC_LOGO_URL || "/logo.png"}
                  alt="ISD Lab Logo"
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </Box>
              <Typography component="h1" variant="h4" fontWeight="bold">
                RFID Attendance
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {isSignUp ? "Create your account" : "Welcome back"}
              </Typography>
            </Box>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ width: "100%" }}
          >
            <Card elevation={3}>
              <CardContent sx={{ p: 4 }}>
                <Box component="form" onSubmit={handleAuth} sx={{ mt: 1 }}>
                  <Stack spacing={3}>
                    {error && (
                      <Fade in>
                        <Alert severity="error" onClose={() => setError(null)}>
                          {error}
                        </Alert>
                      </Fade>
                    )}
                    {success && (
                      <Fade in>
                        <Alert severity="success" onClose={() => setSuccess(null)}>
                          {success}
                        </Alert>
                      </Fade>
                    )}

                    <TextField
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      autoComplete="email"
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      id="password"
                      autoComplete={isSignUp ? "new-password" : "current-password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              size="small"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={loading}
                      size="large"
                      startIcon={
                        loading ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : isSignUp ? (
                          <PersonAdd />
                        ) : (
                          <Login />
                        )
                      }
                      sx={{ 
                        mt: 3, 
                        mb: 2,
                        height: 48,
                      }}
                    >
                      {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
                    </Button>

                    <Divider sx={{ my: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        OR
                      </Typography>
                    </Divider>

                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      startIcon={<Google />}
                      size="large"
                      sx={{
                        height: 48,
                        borderColor: 'divider',
                        color: 'text.primary',
                        '&:hover': {
                          borderColor: 'primary.main',
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      Continue with Google
                    </Button>

                    {/* Google Sign-In button (alternative styled button) */}
                    {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                        <div 
                          id="g_id_signin"
                          data-type="standard"
                          data-shape="rectangular"
                          data-theme="outline"
                          data-text="continue_with"
                          data-size="large"
                          data-logo_alignment="left"
                          style={{ display: 'none' }} // Hidden as we use custom button
                        />
                      </Box>
                    )}

                    <Box textAlign="center">
                      <Typography variant="body2">
                        {isSignUp
                          ? "Already have an account? "
                          : "Don't have an account? "}
                        <Button
                          onClick={() => {
                            setIsSignUp(!isSignUp);
                            setError(null);
                            setSuccess(null);
                            setEmail("");
                            setPassword("");
                          }}
                          sx={{ textTransform: "none", fontWeight: 600 }}
                        >
                          {isSignUp ? "Sign In" : "Sign Up"}
                        </Button>
                      </Typography>
                    </Box>

                    {/* Privacy Policy and Terms */}
                    <Box textAlign="center" sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        By continuing, you agree to our{" "}
                        <Button 
                          size="small" 
                          sx={{ 
                            textTransform: "none", 
                            p: 0, 
                            minWidth: 'auto',
                            fontSize: 'inherit',
                          }}
                        >
                          Terms of Service
                        </Button>
                        {" and "}
                        <Button 
                          size="small" 
                          sx={{ 
                            textTransform: "none", 
                            p: 0, 
                            minWidth: 'auto',
                            fontSize: 'inherit',
                          }}
                        >
                          Privacy Policy
                        </Button>
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Box>
      </Container>
    </>
  );
}
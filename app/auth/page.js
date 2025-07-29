import { login, signup } from './actions'
import Image from "next/image";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  Container,
  Alert,
  Stack,
  Divider,
} from "@mui/material";
import {
  Email,
  Lock,
  Login,
  PersonAdd,
} from "@mui/icons-material";

export default async function LoginPage({ searchParams }) {
  const params = await searchParams
  const message = params?.message

  return (
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
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Box sx={{ position: 'relative', width: 120, height: 120, mx: 'auto', mb: 2 }}>
            <Image
              src="https://res.cloudinary.com/dkqzzck1h/image/upload/v1753551174/isd_lab_logo_bg_removed_xwnjxn.png"
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
            Sign in to your account
          </Typography>
        </Box>

        <Card elevation={3} sx={{ width: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            {message && (
              <Alert 
                severity={message.includes('error') || message.includes('Invalid') ? "error" : "info"} 
                sx={{ mb: 3 }}
              >
                {message}
              </Alert>
            )}
            
            <Stack spacing={3}>
              <form>
                <Stack spacing={3}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    InputProps={{
                      startAdornment: <Email color="action" sx={{ mr: 1 }} />,
                    }}
                  />

                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    InputProps={{
                      startAdornment: <Lock color="action" sx={{ mr: 1 }} />,
                    }}
                  />

                  <Stack direction="row" spacing={2}>
                    <Button
                      type="submit"
                      formAction={login}
                      fullWidth
                      variant="contained"
                      size="large"
                      startIcon={<Login />}
                      sx={{ height: 48 }}
                    >
                      Log in
                    </Button>
                    
                    <Button
                      type="submit"
                      formAction={signup}
                      fullWidth
                      variant="outlined"
                      size="large"
                      startIcon={<PersonAdd />}
                      sx={{ height: 48 }}
                    >
                      Sign up
                    </Button>
                  </Stack>
                </Stack>
              </form>

              <Box textAlign="center" sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
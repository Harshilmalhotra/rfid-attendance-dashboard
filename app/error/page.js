import Link from 'next/link'
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
} from '@mui/material'
import { Home, ArrowBack } from '@mui/icons-material'

export default function ErrorPage() {
  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Card elevation={3} sx={{ width: '100%' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography component="h1" variant="h4" gutterBottom>
              Authentication Error
            </Typography>
            
            <Alert severity="error" sx={{ my: 3 }}>
              Sorry, we couldn't authenticate you. Please try again.
            </Alert>
            
            <Typography variant="body1" paragraph>
              This could be due to:
            </Typography>
            
            <Box sx={{ textAlign: 'left', mb: 3 }}>
              <Typography variant="body2" paragraph>
                • Invalid credentials
              </Typography>
              <Typography variant="body2" paragraph>
                • Expired confirmation link
              </Typography>
              <Typography variant="body2" paragraph>
                • Network issues
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                component={Link}
                href="/auth"
                variant="contained"
                startIcon={<ArrowBack />}
              >
                Back to Login
              </Button>
              
              <Button
                component={Link}
                href="/"
                variant="outlined"
                startIcon={<Home />}
              >
                Go Home
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}
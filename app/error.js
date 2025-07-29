'use client'

import { useEffect } from 'react'
import { Button, Typography, Box } from '@mui/material'

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      textAlign="center"
      px={3}
    >
      <Typography variant="h2" gutterBottom color="error">
        Oops!
      </Typography>
      <Typography variant="h5" gutterBottom>
        Something went wrong
      </Typography>
      <Typography variant="body1" color="textSecondary" mb={3}>
        An unexpected error occurred. Please try again.
      </Typography>
      <Button
        variant="contained"
        onClick={() => reset()}
      >
        Try again
      </Button>
    </Box>
  )
}
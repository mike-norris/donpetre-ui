import { PropsWithChildren } from 'react';
import { Box, Container, Paper, Typography, Stack } from '@mui/material';

const AuthLayout = ({ children }: PropsWithChildren) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'grey.50',
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Box textAlign="center">
              <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                DonPetre
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Knowledge Management Platform
              </Typography>
            </Box>
            {children}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthLayout;

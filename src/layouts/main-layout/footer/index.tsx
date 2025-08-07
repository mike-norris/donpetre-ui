import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box
      sx={{
        mt: 'auto',
        py: 2,
        borderTop: '1px solid',
        borderColor: 'divider',
        textAlign: 'center',
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © 2025 DonPetre Knowledge Management Platform
      </Typography>
    </Box>
  );
};

export default Footer;

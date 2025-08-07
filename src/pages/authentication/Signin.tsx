import React, { useState } from 'react';
import { TextField, Button, Link, Alert, Box, Typography } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { authService } from 'services/auth';
import paths from 'routes/paths';

const Signin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.login(formData);
      navigate(paths.dashboard);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" component="h2" gutterBottom textAlign="center">
        Sign In
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Username"
        name="username"
        value={formData.username}
        onChange={handleChange}
        required
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        required
        sx={{ mb: 3 }}
      />

      <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ mb: 2 }}>
        {loading ? 'Signing In...' : 'Sign In'}
      </Button>

      <Box textAlign="center">
        <Typography variant="body2">
          Don't have an account?{' '}
          <Link component={RouterLink} to={paths.signup}>
            Sign up
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Signin;

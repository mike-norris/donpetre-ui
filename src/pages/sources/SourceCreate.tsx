import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Science as TestIcon,
  GitHub,
  BugReport as JiraIcon,
  Source as GitLabIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { sourcesService } from '../../services/sources';
import { CreateKnowledgeSourceRequest } from '../../types';
import paths from '../../routes/paths';

const SourceCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<CreateKnowledgeSourceRequest>({
    type: 'GITHUB',
    configuration: {},
    isActive: true,
  });

  const handleTypeChange = (type: 'GITHUB' | 'JIRA' | 'GITLAB') => {
    setFormData({
      type,
      configuration: {},
      isActive: true,
    });
    setError('');
    setSuccess('');
  };

  const handleConfigChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      configuration: {
        ...formData.configuration,
        [field]: value,
      },
    });
    setError('');
    setSuccess('');
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setError('');
    setSuccess('');

    try {
      const result = await sourcesService.testConnection(formData);
      if (result.success) {
        setSuccess(result.message || 'Connection test successful!');
      } else {
        setError(result.message || 'Connection test failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Connection test failed');
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const newSource = await sourcesService.createKnowledgeSource(formData);
      navigate(paths.sourcesView.replace(':id', newSource.id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create knowledge source');
    } finally {
      setLoading(false);
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'GITHUB':
        return <GitHub sx={{ mr: 1 }} />;
      case 'JIRA':
        return <JiraIcon sx={{ mr: 1 }} />;
      case 'GITLAB':
        return <GitLabIcon sx={{ mr: 1 }} />;
      default:
        return <GitLabIcon sx={{ mr: 1 }} />;
    }
  };

  const renderConfigurationFields = () => {
    switch (formData.type) {
      case 'GITHUB':
        return (
          <>
            <TextField
              fullWidth
              label="GitHub Token"
              type="password"
              value={formData.configuration.token || ''}
              onChange={(e) => handleConfigChange('token', e.target.value)}
              helperText="Personal access token with repo and read:org permissions"
              sx={{ mb: 3 }}
              required
            />
            <TextField
              fullWidth
              label="Repository Owner/Organization"
              value={formData.configuration.owner || ''}
              onChange={(e) => handleConfigChange('owner', e.target.value)}
              helperText="GitHub username or organization name"
              sx={{ mb: 3 }}
              required
            />
            <TextField
              fullWidth
              label="Repository Name (optional)"
              value={formData.configuration.repo || ''}
              onChange={(e) => handleConfigChange('repo', e.target.value)}
              helperText="Leave empty to sync all repositories in the organization"
              sx={{ mb: 3 }}
            />
          </>
        );

      case 'JIRA':
        return (
          <>
            <TextField
              fullWidth
              label="JIRA URL"
              value={formData.configuration.url || ''}
              onChange={(e) => handleConfigChange('url', e.target.value)}
              placeholder="https://yourcompany.atlassian.net"
              helperText="Your JIRA instance URL"
              sx={{ mb: 3 }}
              required
            />
            <TextField
              fullWidth
              label="Username/Email"
              value={formData.configuration.username || ''}
              onChange={(e) => handleConfigChange('username', e.target.value)}
              helperText="Your JIRA username or email address"
              sx={{ mb: 3 }}
              required
            />
            <TextField
              fullWidth
              label="API Token"
              type="password"
              value={formData.configuration.token || ''}
              onChange={(e) => handleConfigChange('token', e.target.value)}
              helperText="JIRA API token from your account settings"
              sx={{ mb: 3 }}
              required
            />
            <TextField
              fullWidth
              label="Project Key"
              value={formData.configuration.projectKey || ''}
              onChange={(e) => handleConfigChange('projectKey', e.target.value)}
              helperText="JIRA project key (e.g., 'PROJ')"
              sx={{ mb: 3 }}
              required
            />
          </>
        );

      case 'GITLAB':
        return (
          <>
            <TextField
              fullWidth
              label="GitLab URL"
              value={formData.configuration.url || 'https://gitlab.com'}
              onChange={(e) => handleConfigChange('url', e.target.value)}
              helperText="GitLab instance URL (use https://gitlab.com for GitLab.com)"
              sx={{ mb: 3 }}
              required
            />
            <TextField
              fullWidth
              label="Personal Access Token"
              type="password"
              value={formData.configuration.token || ''}
              onChange={(e) => handleConfigChange('token', e.target.value)}
              helperText="GitLab personal access token with api scope"
              sx={{ mb: 3 }}
              required
            />
            <TextField
              fullWidth
              label="Project ID or Path"
              value={formData.configuration.projectId || ''}
              onChange={(e) => handleConfigChange('projectId', e.target.value)}
              helperText="GitLab project ID or full path (e.g., 'group/project')"
              sx={{ mb: 3 }}
              required
            />
          </>
        );

      default:
        return null;
    }
  };

  const isFormValid = () => {
    const { configuration } = formData;
    switch (formData.type) {
      case 'GITHUB':
        return configuration.token && configuration.owner;
      case 'JIRA':
        return (
          configuration.url &&
          configuration.username &&
          configuration.token &&
          configuration.projectKey
        );
      case 'GITLAB':
        return configuration.url && configuration.token && configuration.projectId;
      default:
        return false;
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(paths.sources)}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1">
          Add Knowledge Source
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Source Type</InputLabel>
            <Select
              value={formData.type}
              label="Source Type"
              onChange={(e) => handleTypeChange(e.target.value as any)}
            >
              <MenuItem value="GITHUB">
                <GitHub sx={{ mr: 1 }} /> GitHub
              </MenuItem>
              <MenuItem value="JIRA">
                <JiraIcon sx={{ mr: 1 }} /> JIRA
              </MenuItem>
              <MenuItem value="GITLAB">
                <GitLabIcon sx={{ mr: 1 }} /> GitLab
              </MenuItem>
            </Select>
          </FormControl>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {getSourceIcon(formData.type)}
                <Typography variant="h6">{formData.type} Configuration</Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              {renderConfigurationFields()}
            </CardContent>
          </Card>

          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
            }
            label="Enable this source (start syncing immediately)"
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant="outlined"
              startIcon={testing ? <CircularProgress size={16} /> : <TestIcon />}
              onClick={handleTestConnection}
              disabled={!isFormValid() || testing}
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={loading || !isFormValid()}
            >
              {loading ? 'Creating...' : 'Create Source'}
            </Button>
            <Button variant="outlined" onClick={() => navigate(paths.sources)}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default SourceCreate;

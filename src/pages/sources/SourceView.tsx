import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Divider,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  Sync as SyncIcon,
  GitHub,
  BugReport as JiraIcon,
  Source as GitLabIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { sourcesService } from '../../services/sources';
import { KnowledgeSource } from '../../types';
import paths from '../../routes/paths';
import { format } from 'date-fns';

const SourceView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [source, setSource] = useState<KnowledgeSource | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSource = async () => {
      if (!id) return;

      try {
        const sourceData = await sourcesService.getKnowledgeSource(id);
        setSource(sourceData);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load knowledge source');
      } finally {
        setLoading(false);
      }
    };

    fetchSource();
  }, [id]);

  const handleSync = async () => {
    if (!source) return;

    setSyncing(true);
    try {
      await sourcesService.syncKnowledgeSource(source.id);
      // Refresh source data to get updated lastSync
      const updatedSource = await sourcesService.getKnowledgeSource(source.id);
      setSource(updatedSource);
    } catch (err: any) {
      console.error('Failed to sync source:', err);
    } finally {
      setSyncing(false);
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'GITHUB':
        return <GitHub />;
      case 'JIRA':
        return <JiraIcon />;
      case 'GITLAB':
        return <GitLabIcon />;
      default:
        return <GitLabIcon />;
    }
  };

  const renderConfigurationDetails = (config: Record<string, any>, type: string) => {
    switch (type) {
      case 'GITHUB':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Owner/Organization
              </Typography>
              <Typography variant="body1">{config.owner || 'Not configured'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Repository
              </Typography>
              <Typography variant="body1">{config.repo || 'All repositories'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Token Status
              </Typography>
              <Typography variant="body1">
                {config.token ? 'Configured' : 'Not configured'}
              </Typography>
            </Grid>
          </Grid>
        );

      case 'JIRA':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                JIRA URL
              </Typography>
              <Typography variant="body1">{config.url || 'Not configured'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Username
              </Typography>
              <Typography variant="body1">{config.username || 'Not configured'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Project Key
              </Typography>
              <Typography variant="body1">{config.projectKey || 'Not configured'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Token Status
              </Typography>
              <Typography variant="body1">
                {config.token ? 'Configured' : 'Not configured'}
              </Typography>
            </Grid>
          </Grid>
        );

      case 'GITLAB':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                GitLab URL
              </Typography>
              <Typography variant="body1">{config.url || 'Not configured'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Project ID/Path
              </Typography>
              <Typography variant="body1">{config.projectId || 'Not configured'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Token Status
              </Typography>
              <Typography variant="body1">
                {config.token ? 'Configured' : 'Not configured'}
              </Typography>
            </Grid>
          </Grid>
        );

      default:
        return <Typography>No configuration details available</Typography>;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading source details...</Typography>
      </Box>
    );
  }

  if (error || !source) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error || 'Knowledge source not found'}</Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(paths.sources)}
          sx={{ mt: 2 }}
        >
          Back to Sources
        </Button>
      </Box>
    );
  }

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
        <Box sx={{ flexGrow: 1 }} />
        <Button
          startIcon={<SyncIcon />}
          variant="outlined"
          onClick={handleSync}
          disabled={syncing}
          sx={{ mr: 1 }}
        >
          {syncing ? 'Syncing...' : 'Sync Now'}
        </Button>
        <Button
          startIcon={<EditIcon />}
          variant="contained"
          onClick={() => navigate(paths.sourcesEdit.replace(':id', source.id))}
        >
          Edit
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box sx={{ mr: 2 }}>{getSourceIcon(source.type)}</Box>
          <Box>
            <Typography variant="h4" component="h1">
              {source.type} Source
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Chip
                label={source.isActive ? 'Active' : 'Inactive'}
                color={source.isActive ? 'success' : 'default'}
                size="small"
              />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Configuration
            </Typography>
            {renderConfigurationDetails(source.configuration, source.type)}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Sync Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body1">{format(new Date(source.createdAt), 'PPP')}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body1">{format(new Date(source.updatedAt), 'PPP')}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Last Sync
                </Typography>
                <Typography variant="body1">
                  {source.lastSync ? format(new Date(source.lastSync), 'PPp') : 'Never synced'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Typography variant="body1">{source.isActive ? 'Enabled' : 'Disabled'}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Paper>
    </Box>
  );
};

export default SourceView;

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Sync as SyncIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  GitHub,
  BugReport as JiraIcon,
  Source as GitLabIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { sourcesService } from '../../services/sources';
import { KnowledgeSource } from '../../types';
import paths from '../../routes/paths';
import { format } from 'date-fns';

const SourcesList = () => {
  const navigate = useNavigate();
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    source: KnowledgeSource | null;
  }>({ open: false, source: null });
  const [menuAnchor, setMenuAnchor] = useState<{
    element: HTMLElement | null;
    sourceId: string | null;
  }>({ element: null, sourceId: null });

  const fetchSources = async () => {
    setLoading(true);
    try {
      const response = await sourcesService.getKnowledgeSources();
      setSources(response.content);
    } catch (error) {
      console.error('Failed to fetch sources:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, sourceId: string) => {
    setMenuAnchor({ element: event.currentTarget, sourceId });
  };

  const handleMenuClose = () => {
    setMenuAnchor({ element: null, sourceId: null });
  };

  const handleSync = async (sourceId: string) => {
    setSyncingId(sourceId);
    try {
      await sourcesService.syncKnowledgeSource(sourceId);
      await fetchSources(); // Refresh to get updated lastSync
    } catch (error) {
      console.error('Failed to sync source:', error);
    } finally {
      setSyncingId(null);
    }
    handleMenuClose();
  };

  const handleEdit = (sourceId: string) => {
    navigate(paths.sourcesEdit.replace(':id', sourceId));
    handleMenuClose();
  };

  const handleDeleteConfirm = (source: KnowledgeSource) => {
    setDeleteDialog({ open: true, source });
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!deleteDialog.source) return;

    try {
      await sourcesService.deleteKnowledgeSource(deleteDialog.source.id);
      setSources(sources.filter((s) => s.id !== deleteDialog.source!.id));
      setDeleteDialog({ open: false, source: null });
    } catch (error) {
      console.error('Failed to delete source:', error);
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

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading sources...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Knowledge Sources
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate(paths.sourcesCreate)}
        >
          Add Source
        </Button>
      </Box>

      {sources.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Knowledge Sources Configured
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Connect your external systems like GitHub, JIRA, or GitLab to automatically ingest
              knowledge.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate(paths.sourcesCreate)}
            >
              Add Your First Source
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {sources.map((source) => (
            <Grid item xs={12} sm={6} md={4} key={source.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ mr: 2 }}>{getSourceIcon(source.type)}</Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">{source.type}</Typography>
                      <Chip
                        label={source.isActive ? 'Active' : 'Inactive'}
                        color={source.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, source.id)}
                      size="small"
                      disabled={syncingId === source.id}
                    >
                      {syncingId === source.id ? <SyncIcon /> : <MoreVertIcon />}
                    </IconButton>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Created: {format(new Date(source.createdAt), 'MMM dd, yyyy')}
                  </Typography>

                  {source.lastSync && (
                    <Typography variant="body2" color="text.secondary">
                      Last Sync: {format(new Date(source.lastSync), 'MMM dd, yyyy HH:mm')}
                    </Typography>
                  )}

                  {!source.lastSync && (
                    <Typography variant="body2" color="warning.main">
                      Never synced
                    </Typography>
                  )}
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    onClick={() => navigate(paths.sourcesView.replace(':id', source.id))}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor.element}
        open={Boolean(menuAnchor.element)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => handleSync(menuAnchor.sourceId!)}
          disabled={syncingId === menuAnchor.sourceId}
        >
          <SyncIcon sx={{ mr: 1 }} fontSize="small" />
          Sync Now
        </MenuItem>
        <MenuItem onClick={() => handleEdit(menuAnchor.sourceId!)}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            const source = sources.find((s) => s.id === menuAnchor.sourceId);
            if (source) handleDeleteConfirm(source);
          }}
        >
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, source: null })}
      >
        <DialogTitle>Delete Knowledge Source</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this {deleteDialog.source?.type} source? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, source: null })}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SourcesList;

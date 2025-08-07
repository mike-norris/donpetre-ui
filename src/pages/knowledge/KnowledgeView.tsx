import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Chip, Button, Divider, Link } from '@mui/material';
import {
  Edit as EditIcon,
  OpenInNew as OpenInNewIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { knowledgeService } from 'services/knowledge';
import { KnowledgeItem } from '../../types';
import paths from 'routes/paths';
import { format } from 'date-fns';

const KnowledgeView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<KnowledgeItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;

      try {
        const knowledgeItem = await knowledgeService.getKnowledgeItem(id);
        setItem(knowledgeItem);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load knowledge item');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const getSourceColor = (sourceType: string) => {
    switch (sourceType) {
      case 'GITHUB':
        return 'primary';
      case 'JIRA':
        return 'secondary';
      case 'GITLAB':
        return 'info';
      case 'MANUAL':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (error || !item) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error || 'Knowledge item not found'}</Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(paths.knowledge)}
          sx={{ mt: 2 }}
        >
          Back to Knowledge Base
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(paths.knowledge)}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          startIcon={<EditIcon />}
          variant="outlined"
          onClick={() => navigate(paths.knowledgeEdit.replace(':id', item.id))}
        >
          Edit
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {item.title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <Chip
            label={item.sourceType}
            color={getSourceColor(item.sourceType) as any}
            size="small"
          />

          {item.tags.map((tag: string) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Box>

        {item.summary && (
          <>
            <Typography variant="h6" gutterBottom>
              Summary
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }} color="text.secondary">
              {item.summary}
            </Typography>
          </>
        )}

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Content
        </Typography>
        <Typography
          variant="body1"
          sx={{
            mb: 3,
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
          }}
        >
          {item.content}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Created: {format(new Date(item.createdAt), 'PPP')}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Updated: {format(new Date(item.updatedAt), 'PPP')}
            </Typography>
            {item.author && (
              <Typography variant="caption" color="text.secondary" display="block">
                Author: {item.author.firstName} {item.author.lastName} ({item.author.username})
              </Typography>
            )}
          </Box>

          {item.sourceUrl && (
            <Button
              component={Link}
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<OpenInNewIcon />}
              variant="outlined"
              size="small"
            >
              View Source
            </Button>
          )}
        </Box>

        {Object.keys(item.metadata || {}).length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              Metadata
            </Typography>
            <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
              <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                {JSON.stringify(item.metadata, null, 2)}
              </pre>
            </Paper>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default KnowledgeView;

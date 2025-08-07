import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { knowledgeService } from 'services/knowledge';
import paths from 'routes/paths';

const KnowledgeCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    sourceType: 'MANUAL' as const,
    sourceUrl: '',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData({
        ...formData,
        [field]: e.target.value,
      });
      if (error) setError('');
    };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, trimmedTag],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const newItem = await knowledgeService.createKnowledgeItem({
        title: formData.title,
        content: formData.content,
        summary: formData.summary || undefined,
        sourceType: formData.sourceType,
        sourceUrl: formData.sourceUrl || undefined,
        tags: formData.tags,
        metadata: {},
      });

      navigate(paths.knowledgeView.replace(':id', newItem.id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create knowledge item');
    } finally {
      setLoading(false);
    }
  };

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
        <Typography variant="h4" component="h1">
          Create Knowledge Item
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Title"
            required
            value={formData.title}
            onChange={handleChange('title')}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Summary (optional)"
            multiline
            rows={2}
            value={formData.summary}
            onChange={handleChange('summary')}
            helperText="A brief summary of the knowledge item"
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Content"
            required
            multiline
            rows={10}
            value={formData.content}
            onChange={handleChange('content')}
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Source Type</InputLabel>
              <Select
                value={formData.sourceType}
                label="Source Type"
                onChange={(e) => setFormData({ ...formData, sourceType: e.target.value as any })}
              >
                <MenuItem value="MANUAL">Manual</MenuItem>
                <MenuItem value="GITHUB">GitHub</MenuItem>
                <MenuItem value="JIRA">JIRA</MenuItem>
                <MenuItem value="GITLAB">GitLab</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Source URL (optional)"
              type="url"
              value={formData.sourceUrl}
              onChange={handleChange('sourceUrl')}
              helperText="Link to the original source"
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Tags
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              {formData.tags.map((tag) => (
                <Chip key={tag} label={tag} onDelete={() => handleRemoveTag(tag)} size="small" />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagInputKeyPress}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
              >
                Add
              </Button>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={loading || !formData.title || !formData.content}
            >
              {loading ? 'Creating...' : 'Create Knowledge Item'}
            </Button>
            <Button variant="outlined" onClick={() => navigate(paths.knowledge)}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default KnowledgeCreate;

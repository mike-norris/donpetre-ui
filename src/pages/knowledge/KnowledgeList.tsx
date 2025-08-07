import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Pagination,
  Fab,
} from '@mui/material';
import { Search as SearchIcon, Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { knowledgeService } from 'services/knowledge';
import { KnowledgeItem, PaginatedResponse } from '../../types';
import paths from 'routes/paths';
import { format } from 'date-fns';

const KnowledgeList = () => {
  const navigate = useNavigate();
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 0,
    size: 12,
    totalPages: 0,
    totalElements: 0,
  });

  const fetchKnowledgeItems = async (page = 0, search = '') => {
    setLoading(true);
    try {
      let response: PaginatedResponse<KnowledgeItem>;

      if (search) {
        const searchResponse = await knowledgeService.searchKnowledge({
          query: search,
          page,
          size: pagination.size,
        });
        response = {
          content: searchResponse.results.map((r: any) => r.knowledgeItem),
          totalElements: searchResponse.totalCount,
          totalPages: searchResponse.totalPages,
          size: searchResponse.size,
          number: searchResponse.page,
          first: searchResponse.page === 0,
          last: searchResponse.page === searchResponse.totalPages - 1,
        };
      } else {
        response = await knowledgeService.getKnowledgeItems(page, pagination.size);
      }

      setKnowledgeItems(response.content);
      setPagination({
        page: response.number,
        size: response.size,
        totalPages: response.totalPages,
        totalElements: response.totalElements,
      });
    } catch (error) {
      console.error('Failed to fetch knowledge items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledgeItems(0, searchTerm);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    fetchKnowledgeItems(0, searchTerm);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    fetchKnowledgeItems(newPage - 1, searchTerm);
  };

  const handleViewItem = (id: string) => {
    navigate(paths.knowledgeView.replace(':id', id));
  };

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

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Knowledge Base
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate(paths.knowledgeCreate)}
        >
          Create
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search knowledge items..."
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyPress={handleSearchKeyPress}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Button onClick={handleSearch} variant="contained" size="small">
                  Search
                </Button>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {pagination.totalElements} items found
          </Typography>

          <Grid container spacing={3}>
            {knowledgeItems.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {item.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2, minHeight: 60 }}
                    >
                      {item.summary || `${item.content.substring(0, 120)}...`}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={item.sourceType}
                        color={getSourceColor(item.sourceType) as any}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      {item.tags.slice(0, 2).map((tag: string) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 1 }}
                        />
                      ))}
                      {item.tags.length > 2 && (
                        <Chip label={`+${item.tags.length - 2}`} size="small" variant="outlined" />
                      )}
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(item.createdAt), 'MMM dd, yyyy')}
                    </Typography>
                  </CardContent>

                  <CardActions>
                    <Button size="small" onClick={() => handleViewItem(item.id)}>
                      View
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.page + 1}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => navigate(paths.knowledgeCreate)}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default KnowledgeList;

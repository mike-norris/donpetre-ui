import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Grid,
  Pagination,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { knowledgeService } from 'services/knowledge';
import { SearchResult, SearchRequest } from '../../types';
import paths from 'routes/paths';
import { format } from 'date-fns';

const SearchResults = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalCount: 0,
  });
  const [filters, setFilters] = useState({
    sourceTypes: [] as string[],
    tags: [] as string[],
  });
  const [showFilters, setShowFilters] = useState(false);

  const sourceTypes = ['GITHUB', 'JIRA', 'GITLAB', 'MANUAL'];

  const performSearch = async (query: string, page = 0, searchFilters = filters) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const request: SearchRequest = {
        query: query.trim(),
        page,
        size: pagination.size,
        filters: {
          sourceType: searchFilters.sourceTypes.length > 0 ? searchFilters.sourceTypes : undefined,
          tags: searchFilters.tags.length > 0 ? searchFilters.tags : undefined,
        },
      };

      const response = await knowledgeService.searchKnowledge(request);
      setResults(response.results);
      setPagination({
        page: response.page,
        size: response.size,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
      });

      // Update URL parameters
      const params = new URLSearchParams();
      params.set('q', query);
      if (page > 0) params.set('page', (page + 1).toString());
      setSearchParams(params);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1') - 1;

    if (query) {
      setSearchTerm(query);
      performSearch(query, page);
    }
  }, []);

  const handleSearch = () => {
    performSearch(searchTerm, 0, filters);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    performSearch(searchTerm, newPage - 1, filters);
  };

  const handleFilterChange = (type: 'sourceTypes' | 'tags', value: string) => {
    const newFilters = {
      ...filters,
      [type]: filters[type].includes(value)
        ? filters[type].filter((item) => item !== value)
        : [...filters[type], value],
    };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    performSearch(searchTerm, 0, filters);
  };

  const clearFilters = () => {
    setFilters({ sourceTypes: [], tags: [] });
    performSearch(searchTerm, 0, { sourceTypes: [], tags: [] });
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
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Search Knowledge
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search knowledge items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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

      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Filters Sidebar */}
        <Box sx={{ width: 250, display: { xs: 'none', md: 'block' } }}>
          <Paper sx={{ p: 2, position: 'sticky', top: 20 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FilterIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Filters</Typography>
            </Box>

            <Typography variant="subtitle2" gutterBottom>
              Source Type
            </Typography>
            {sourceTypes.map((type) => (
              <FormControlLabel
                key={type}
                control={
                  <Checkbox
                    size="small"
                    checked={filters.sourceTypes.includes(type)}
                    onChange={() => handleFilterChange('sourceTypes', type)}
                  />
                }
                label={type}
                sx={{ display: 'block' }}
              />
            ))}

            <Box sx={{ mt: 2, mb: 2 }}>
              <Button size="small" onClick={applyFilters} variant="outlined" fullWidth>
                Apply Filters
              </Button>
            </Box>
            <Button size="small" onClick={clearFilters} variant="text" fullWidth>
              Clear All
            </Button>
          </Paper>
        </Box>

        {/* Mobile Filters */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, width: '100%' }}>
          <Accordion expanded={showFilters} onChange={() => setShowFilters(!showFilters)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <FilterIcon sx={{ mr: 1 }} />
              <Typography>Filters</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="subtitle2" gutterBottom>
                Source Type
              </Typography>
              {sourceTypes.map((type) => (
                <FormControlLabel
                  key={type}
                  control={
                    <Checkbox
                      size="small"
                      checked={filters.sourceTypes.includes(type)}
                      onChange={() => handleFilterChange('sourceTypes', type)}
                    />
                  }
                  label={type}
                  sx={{ display: 'block' }}
                />
              ))}
              <Box sx={{ mt: 2 }}>
                <Button size="small" onClick={applyFilters} variant="outlined" sx={{ mr: 1 }}>
                  Apply
                </Button>
                <Button size="small" onClick={clearFilters} variant="text">
                  Clear
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Box>

        {/* Results */}
        <Box sx={{ flexGrow: 1 }}>
          {loading ? (
            <Typography>Searching...</Typography>
          ) : (
            <>
              {pagination.totalCount > 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {pagination.totalCount} results found
                </Typography>
              )}

              {results.length === 0 && searchTerm && !loading && (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary">
                    No results found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting your search terms or filters
                  </Typography>
                </Paper>
              )}

              <Grid container spacing={2}>
                {results.map((result) => (
                  <Grid item xs={12} key={result.knowledgeItem.id}>
                    <Card>
                      <CardContent>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'start',
                            mb: 1,
                          }}
                        >
                          <Typography variant="h6" component="h3">
                            {result.knowledgeItem.title}
                          </Typography>
                          <Chip
                            label={result.knowledgeItem.sourceType}
                            color={getSourceColor(result.knowledgeItem.sourceType) as any}
                            size="small"
                          />
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {result.knowledgeItem.summary ||
                            `${result.knowledgeItem.content.substring(0, 200)}...`}
                        </Typography>

                        {result.highlights.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              Matches:
                            </Typography>
                            {result.highlights
                              .slice(0, 2)
                              .map((highlight: string, index: number) => (
                                <Typography
                                  key={index}
                                  variant="body2"
                                  sx={{
                                    backgroundColor: 'yellow.100',
                                    p: 1,
                                    borderRadius: 1,
                                    mt: 1,
                                    fontSize: '0.875rem',
                                  }}
                                  dangerouslySetInnerHTML={{ __html: highlight }}
                                />
                              ))}
                          </Box>
                        )}

                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                          {result.knowledgeItem.tags.slice(0, 3).map((tag: string) => (
                            <Chip key={tag} label={tag} size="small" variant="outlined" />
                          ))}
                          {result.knowledgeItem.tags.length > 3 && (
                            <Chip
                              label={`+${result.knowledgeItem.tags.length - 3} more`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>

                        <Typography variant="caption" color="text.secondary">
                          Score: {(result.score * 100).toFixed(1)}% | Created:{' '}
                          {format(new Date(result.knowledgeItem.createdAt), 'MMM dd, yyyy')}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          onClick={() =>
                            navigate(paths.knowledgeView.replace(':id', result.knowledgeItem.id))
                          }
                        >
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
        </Box>
      </Box>
    </Box>
  );
};

export default SearchResults;

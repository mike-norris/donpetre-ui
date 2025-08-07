import { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
} from '@mui/material';
import { TrendingUp, LibraryBooks, Search, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { knowledgeService } from 'services/knowledge';
import { KnowledgeItem } from '../../types';
import paths from 'routes/paths';

const Dashboard = () => {
  const navigate = useNavigate();
  const [recentKnowledge, setRecentKnowledge] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalKnowledge: 0,
    totalSources: 0,
    recentItems: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await knowledgeService.getKnowledgeItems(0, 5);
        setRecentKnowledge(response.content);
        setStats({
          totalKnowledge: response.totalElements,
          totalSources: 3, // placeholder
          recentItems: response.content.length,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const quickActions = [
    {
      title: 'Create Knowledge',
      description: 'Add new knowledge item',
      icon: Add,
      action: () => navigate(paths.knowledgeCreate),
      color: 'primary' as const,
    },
    {
      title: 'Search Knowledge',
      description: 'Find existing knowledge',
      icon: Search,
      action: () => navigate(paths.search),
      color: 'secondary' as const,
    },
    {
      title: 'Browse All',
      description: 'View all knowledge items',
      icon: LibraryBooks,
      action: () => navigate(paths.knowledge),
      color: 'info' as const,
    },
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LibraryBooks sx={{ mr: 2, color: 'primary.main' }} />
              <Box>
                <Typography variant="h6">{stats.totalKnowledge}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Knowledge Items
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUp sx={{ mr: 2, color: 'success.main' }} />
              <Box>
                <Typography variant="h6">{stats.recentItems}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Recent Items
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Search sx={{ mr: 2, color: 'info.main' }} />
              <Box>
                <Typography variant="h6">{stats.totalSources}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Connected Sources
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Grid item xs={12} sm={6} md={4} key={action.title}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Icon sx={{ mr: 1, color: `${action.color}.main` }} />
                        <Typography variant="h6">{action.title}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {action.description}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" color={action.color} onClick={action.action}>
                        Open
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Grid>

        {/* Recent Knowledge */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Recent Knowledge Items
          </Typography>
          <Grid container spacing={2}>
            {recentKnowledge.map((item) => (
              <Grid item xs={12} md={6} key={item.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {item.summary || item.content.substring(0, 150)}...
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {item.tags.slice(0, 3).map((tag: string) => (
                        <Chip key={tag} label={tag} size="small" />
                      ))}
                      {item.tags.length > 3 && (
                        <Chip
                          label={`+${item.tags.length - 3} more`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => navigate(paths.knowledgeView.replace(':id', item.id))}
                    >
                      View
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

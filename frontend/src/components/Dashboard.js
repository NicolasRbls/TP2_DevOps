import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import CampaignIcon from '@mui/icons-material/Campaign';
import MoneyIcon from '@mui/icons-material/Money';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import EditNoteIcon from '@mui/icons-material/EditNote';

const Dashboard = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalBudget: 0,
  });

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await axios.get('/api/campaigns');
        setCampaigns(response.data);
        
        // Calculer les statistiques
        const active = response.data.filter(campaign => campaign.status === 'active').length;
        const totalBudget = response.data.reduce((sum, campaign) => sum + parseFloat(campaign.budget), 0);
        
        setStats({
          totalCampaigns: response.data.length,
          activeCampaigns: active,
          totalBudget: totalBudget,
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des campagnes :', error);
      }
    };
    
    fetchCampaigns();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Tableau de Bord
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          component={Link} 
          to="/campaigns/new"
          startIcon={<AddIcon />}
        >
          Nouvelle Campagne
        </Button>
      </Box>
      
      {/* Statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <CampaignIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
            <div>
              <Typography variant="h4">{stats.totalCampaigns}</Typography>
              <Typography variant="body1">Campagnes Totales</Typography>
            </div>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 40, mr: 2, color: 'success.main' }} />
            <div>
              <Typography variant="h4">{stats.activeCampaigns}</Typography>
              <Typography variant="body1">Campagnes Actives</Typography>
            </div>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
            <MoneyIcon sx={{ fontSize: 40, mr: 2, color: 'secondary.main' }} />
            <div>
              <Typography variant="h4">{stats.totalBudget.toFixed(2)} €</Typography>
              <Typography variant="body1">Budget Total</Typography>
            </div>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Campagnes récentes */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Campagnes Récentes
      </Typography>
      <Grid container spacing={3}>
        {campaigns.slice(0, 3).map((campaign) => (
          <Grid item xs={12} sm={4} key={campaign.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div">
                  {campaign.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <MoneyIcon sx={{ color: 'secondary.main', mr: 1, fontSize: 18 }} />
                  <Typography variant="body1">
                    {parseFloat(campaign.budget).toFixed(2)} €
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  {campaign.status === 'active' ? (
                    <CheckCircleIcon sx={{ color: 'success.main', mr: 1, fontSize: 18 }} />
                  ) : campaign.status === 'pending' ? (
                    <PendingIcon sx={{ color: 'warning.main', mr: 1, fontSize: 18 }} />
                  ) : (
                    <EditNoteIcon sx={{ color: 'info.main', mr: 1, fontSize: 18 }} />
                  )}
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                    {campaign.status}
                  </Typography>
                </Box>
                <Button 
                  component={Link} 
                  to={`/campaigns/edit/${campaign.id}`}
                  variant="outlined" 
                  size="small" 
                  sx={{ mt: 2 }}
                >
                  Modifier
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {campaigns.length > 3 && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button component={Link} to="/campaigns" variant="outlined">
            Voir toutes les campagnes
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;
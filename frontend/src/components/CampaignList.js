import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

const CampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get('/api/campaigns');
      setCampaigns(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des campagnes :', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors du chargement des campagnes',
        severity: 'error'
      });
    }
  };

  const handleDeleteClick = (campaign) => {
    setCampaignToDelete(campaign);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`/api/campaigns/${campaignToDelete.id}`);
      setCampaigns(campaigns.filter(c => c.id !== campaignToDelete.id));
      setSnackbar({
        open: true,
        message: 'Campagne supprimée avec succès',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression :', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de la suppression de la campagne',
        severity: 'error'
      });
    }
    setOpenDialog(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusChip = (status) => {
    let color = 'default';
    
    switch(status) {
      case 'active':
        color = 'success';
        break;
      case 'pending':
        color = 'warning';
        break;
      case 'draft':
        color = 'info';
        break;
      default:
        color = 'default';
    }
    
    return (
      <Chip 
        label={status} 
        color={color} 
        size="small" 
        sx={{ textTransform: 'capitalize' }}
      />
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Liste des Campagnes
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
      
      {campaigns.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">Aucune campagne trouvée</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            component={Link} 
            to="/campaigns/new"
            sx={{ mt: 2 }}
          >
            Créer votre première campagne
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell align="right">Budget (€)</TableCell>
                <TableCell align="center">Statut</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell component="th" scope="row">
                    {campaign.name}
                  </TableCell>
                  <TableCell align="right">{parseFloat(campaign.budget).toFixed(2)}</TableCell>
                  <TableCell align="center">
                    {getStatusChip(campaign.status)}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      component={Link} 
                      to={`/campaigns/edit/${campaign.id}`}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteClick(campaign)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer la campagne "{campaignToDelete?.name}" ? 
            Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Annuler
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar pour les notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CampaignList;
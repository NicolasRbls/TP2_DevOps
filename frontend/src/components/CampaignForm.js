import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

const statusOptions = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'pending', label: 'En attente' },
  { value: 'active', label: 'Active' },
];

const CampaignForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    budget: '',
    status: 'draft',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    if (isEditMode) {
      fetchCampaign();
    }
  }, [id]);
  
  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/campaigns/${id}`);
      setFormData({
        name: response.data.name,
        budget: response.data.budget,
        status: response.data.status,
      });
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération de la campagne :', error);
      setError('Impossible de charger les détails de la campagne');
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation de base
    if (!formData.name || !formData.budget || !formData.status) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      if (isEditMode) {
        // Mise à jour d'une campagne existante
        await axios.put(`/api/campaigns/${id}`, formData);
        setSuccess('Campagne mise à jour avec succès !');
      } else {
        // Création d'une nouvelle campagne
        await axios.post('/api/campaigns', formData);
        setSuccess('Campagne créée avec succès !');
        // Réinitialiser le formulaire pour une nouvelle campagne
        setFormData({
          name: '',
          budget: '',
          status: 'draft',
        });
      }
      
      setLoading(false);
      
      // Rediriger après 1 seconde
      setTimeout(() => {
        navigate('/campaigns');
      }, 1000);
      
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement :', error);
      setError('Une erreur est survenue lors de l\'enregistrement');
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/campaigns');
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleCancel}
        >
          Retour à la liste
        </Button>
      </Box>
      
      <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {isEditMode ? 'Modifier la Campagne' : 'Créer une Nouvelle Campagne'}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        
        {loading && !isEditMode ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <TextField
              name="name"
              label="Nom de la campagne"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="outlined"
              required
            />
            
            <TextField
              name="budget"
              label="Budget"
              type="number"
              value={formData.budget}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="outlined"
              required
              InputProps={{
                startAdornment: <InputAdornment position="start">€</InputAdornment>,
                inputProps: { min: 0, step: "0.01" }
              }}
            />
            
            <TextField
              name="status"
              label="Statut"
              select
              value={formData.status}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="outlined"
              required
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="outlined" 
                onClick={handleCancel}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                startIcon={<SaveIcon />}
                disabled={loading}
              >
                {loading ? 'Enregistrement...' : isEditMode ? 'Mettre à jour' : 'Créer'}
              </Button>
            </Box>
          </form>
        )}
      </Paper>
    </Box>
  );
};

export default CampaignForm;
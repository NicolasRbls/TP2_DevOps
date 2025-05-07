import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import CampaignIcon from '@mui/icons-material/Campaign';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';

const AppHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = async () => {
    await logout();
    handleMenuClose();
    navigate('/login');
  };
  
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <CampaignIcon sx={{ mr: 1 }} />
            AdCampaign Manager
          </Link>
        </Typography>
        
        {user ? (
          <>
            <Button color="inherit" component={Link} to="/" startIcon={<DashboardIcon />}>
              Dashboard
            </Button>
            <Button color="inherit" component={Link} to="/campaigns">
              Campagnes
            </Button>
            <Button 
              variant="contained" 
              color="secondary" 
              component={Link} 
              to="/campaigns/new"
              sx={{ ml: 2, mr: 2 }}
            >
              Nouvelle Campagne
            </Button>
            
            <IconButton 
              onClick={handleMenuOpen}
              color="inherit"
              aria-controls="user-menu"
              aria-haspopup="true"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {user.username.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            
            <Menu
              id="user-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem sx={{ px: 2, py: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {user.username}
                </Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <LogoutIcon sx={{ mr: 1, fontSize: 18 }} />
                Déconnexion
              </MenuItem>
            </Menu>
          </>
        ) : (
          <>
            <Button color="inherit" component={Link} to="/login">
              Connexion
            </Button>
            <Button color="inherit" component={Link} to="/register">
              Inscription
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;
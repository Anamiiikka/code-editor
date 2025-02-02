import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useAuth0 } from '@auth0/auth0-react';

// Header Component
function Header({ drawerOpen, setDrawerOpen }) {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

  return (
    <AppBar position="fixed">
      <Toolbar>
        {/* Hamburger Icon */}
        <IconButton
          edge="start"
          color="inherit"
          onClick={() => setDrawerOpen(!drawerOpen)}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        {/* Title */}
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          CODEV
        </Typography>
        {/* Auth0 Login/Logout Buttons */}
        {!isAuthenticated && (
          <Button
            onClick={() => loginWithRedirect()}
            sx={{
              backgroundColor: '#BBE613',
              color: 'black',
              borderRadius: '6px',
              padding: '5px 15px',
              transition: '0.3s',
              '&:hover': {
                backgroundColor: '#D4FF2A',
              },
            }}
          >
            Log In
          </Button>
        )}
        {isAuthenticated && (
          <>
            <Typography variant="body1" sx={{ marginRight: 2 }}>
              Welcome, {user.name}!
            </Typography>
            <Button
              onClick={() => logout()}
              sx={{
                backgroundColor: '#BBE613',
                color: 'black',
                borderRadius: '6px',
                padding: '5px 15px',
                transition: '0.3s',
                '&:hover': {
                  backgroundColor: '#D4FF2A',
                },
              }}
            >
              Log Out
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
export default Header;
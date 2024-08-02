'use client';
import { useState } from 'react';
import { Box, Typography, Drawer, List, ListItem, ListItemText, Button, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useRouter } from 'next/navigation';

const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const handleNavigate = (path) => () => {
    router.push(path);
    setDrawerOpen(false);
  };

  return (
    <Box>
      <Box 
        width="100%" 
        bgcolor="#0A4D68" 
        py={2} 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        position="relative"
      >
        <Button 
          onClick={toggleDrawer(true)} 
          color="inherit" 
          style={{ position: 'absolute', left: 16 }}
        >
          <MenuIcon style={{ color: '#FFF4DD' }} />
        </Button>

        <Typography 
          variant="h4" 
          color="#FFF4DD" 
          fontWeight="bold" 
          textAlign="center"
        >
          PANTRY TRACKER
        </Typography>
      </Box>

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          width={250}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
          sx={{ backgroundColor: '#FFF4DD', height: '100%' }}
        >
          <Box
            px={2}
            py={1}
            bgcolor="#0A4D68"
            color="#FFF4DD"
            display="flex"
            alignItems="center"
            height="75px"
          >
            <Typography variant="h6" fontWeight="bold">MENU</Typography>
          </Box>
          <Divider />
          <List>
            <Divider></Divider>
            <ListItem button onClick={handleNavigate('/')}>
              <ListItemText primary="Home" />
            </ListItem>
            <Divider></Divider>
            <ListItem button onClick={handleNavigate('/inventory')}>
              <ListItemText primary="Inventory Items" />
            </ListItem>
            <Divider></Divider>
            <ListItem button onClick={handleNavigate('/recipe')}>
              <ListItemText primary="Recipe Suggestion" />
            </ListItem>
            <Divider></Divider>
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

export default Header;

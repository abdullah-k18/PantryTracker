'use client';
import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardMedia, TextField } from '@mui/material';
import { useRouter } from 'next/navigation';
import { firestore } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const snapshot = await getDocs(collection(firestore, 'inventory'));
        const items = snapshot.docs.map(doc => ({
          name: doc.id,
          ...doc.data()
        }));
        console.log("Fetched items:", items);
        setInventory(items);
      } catch (error) {
        console.error("Error fetching inventory:", error);
      }
    };

    fetchInventory();
  }, []);

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Box p={4} display="flex" justifyContent="center">
      <TextField
        variant="outlined"
        size="small"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{
          width: '300px',
          mb: 4,
          borderRadius: '50px', // Adjust this value to achieve the desired roundness
          '.MuiOutlinedInput-root': {
            borderRadius: '50px', // Ensure the input itself has rounded corners
          },
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />


      </Box>
      <Box>
        <Grid container spacing={4} justifyContent="center">
          {filteredInventory.length === 0 ? (
            <Typography variant="h6" color="red">
              No items found
            </Typography>
          ) : (
            filteredInventory.map(({name, quantity, imageUrl}) => (
              <Grid item xs={12} sm={4} md={3} key={name}>
                <Card>
                  {imageUrl && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={imageUrl}
                      alt={name}
                    />
                  )}
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h5" component="div" fontWeight="bold">
                        {name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Quantity: {quantity}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Box>
    </Box>
  );
  
}

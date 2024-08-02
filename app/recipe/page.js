'use client';
import { useState, useEffect } from 'react';
import { Box, Typography, Button, List, ListItem, Checkbox, FormControlLabel, TextField } from '@mui/material';
import { firestore } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";

const fetchRecipeSuggestions = async (ingredients) => {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": `${siteUrl}`, // Optional
      "X-Title": `${siteName}`, // Optional
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "model": "openai/gpt-3.5-turbo",
      "messages": [
        { "role": "user", "content": `Suggest a recipe using the following ingredients: ${ingredients.join(", ")}` }
      ],
    })
  });

  if (!response.ok) {
    throw new Error('Error fetching recipe suggestions');
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

export default function RecipePage() {
  const [inventory, setInventory] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [suggestedRecipe, setSuggestedRecipe] = useState('');

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const snapshot = await getDocs(collection(firestore, 'inventory'));
        const items = snapshot.docs.map(doc => ({
          name: doc.id,
          ...doc.data()
        }));
        setInventory(items);
      } catch (error) {
        console.error("Error fetching inventory:", error);
      }
    };

    fetchInventory();
  }, []);

  const handleSelectIngredient = (ingredient) => {
    setSelectedIngredients(prev => 
      prev.includes(ingredient) ? prev.filter(item => item !== ingredient) : [...prev, ingredient]
    );
  };

  const handleGetRecipes = async () => {
    try {
      const recipe = await fetchRecipeSuggestions(selectedIngredients);
      setSuggestedRecipe(recipe);
    } catch (error) {
      console.error("Error fetching recipe suggestions:", error);
      setSuggestedRecipe('Error fetching recipe suggestions. Please try again.');
    }
  };

  return (
    <Box p={4}>
      <Typography marginLeft="55px" marginBottom="10px" variant="h4" align="left" color="black" fontWeight="bold" >Recipe Suggestion</Typography>
      <Typography marginLeft="55px" marginBottom="20px" variant="h6"  align="left" color="black">Select items from your inventory and let AI generate recipe for you.</Typography>
      <Box display="flex" justifyContent="center">
        <Box
          width="45%"
          sx={{ height: '250px', overflow: 'auto', border: '1px solid #ccc', borderRadius: '4px', padding: '16px', maxHeight: '400px', overflowY: 'auto' }}
        >
          <Typography variant="h6" mb={2} sx={{ backgroundColor: '#0A4D68', color: '#FFF4DD', padding: '8px', borderRadius: '4px', textAlign:"center"}}>Inventory Items</Typography>
          <List>
            {inventory.map(({ name }) => (
              <ListItem key={name} sx={{ display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={selectedIngredients.includes(name)}
                      onChange={() => handleSelectIngredient(name)}
                    />
                  }
                  label={<Typography variant="body2">{name}</Typography>}
                />
              </ListItem>
            ))}
          </List>
        </Box>
        <Box
          width="45%"
          ml={4}
          sx={{ height: '250px', overflow: 'auto', border: '1px solid #ccc', borderRadius: '4px', padding: '16px', maxHeight: '400px', overflowY: 'auto' }}
        >
          <Typography variant="h6" mb={2} sx={{ backgroundColor: '#0A4D68', color: '#FFF4DD', padding: '8px', borderRadius: '4px', textAlign:"center"}}>Selected Ingredients</Typography>
          <List>
            {selectedIngredients.map((ingredient, index) => (
              <ListItem key={index}>
                <Typography variant="body2">{ingredient}</Typography>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
        <Button variant="contained" onClick={handleGetRecipes} sx={{ backgroundColor: '#0A4D68', color: '#FFF4DD', '&:hover': {
          backgroundColor: '#084C61',
          transform: 'scale(1.1)'} }}>
          Generate Recipe
        </Button>
        <Box mt={4} width="100%">
          <TextField
            fullWidth
            multiline
            minRows={4}
            variant="outlined"
            value={suggestedRecipe}
            InputProps={{ readOnly: true }}
          />
        </Box>
      </Box>
    </Box>
  );
}

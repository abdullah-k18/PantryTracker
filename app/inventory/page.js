'use client'
import { useState, useEffect } from "react";
import { firestore, storage } from "@/firebase";
import { Box, Modal, Button, Stack, TextField, Typography, Divider } from '@mui/material';
import { getFirestore, collection, query, doc, getDoc, setDoc, deleteDoc, getDocs } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [editItem, setEditItem] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  const addItem = async (item, qty, imgUrl) => {
    if (qty <= 0) return;

    const docRef = doc(collection(firestore, 'inventory'), item);
    await setDoc(docRef, { quantity: qty, imageUrl: imgUrl });
    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      await deleteDoc(docRef);
    }
    await updateInventory();
  };

  const handleEdit = async () => {
    if (editItem && itemName && quantity) {
      if (image) {
        const storageRef = ref(storage, `images/${image.name}`);
        const uploadTask = uploadBytesResumable(storageRef, image);
  
        uploadTask.on('state_changed',
          (snapshot) => {
          },
          (error) => {
            console.error("Error uploading image: ", error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setImageUrl(downloadURL);
  
            const oldDocRef = doc(collection(firestore, 'inventory'), editItem);
            await deleteDoc(oldDocRef);
  
            await addItem(itemName, parseInt(quantity), downloadURL);
  
            setEditItem('');
            setItemName('');
            setQuantity('');
            setImage(null);
            setImageUrl('');
            handleClose();
          }
        );
      } else {
        const oldDocRef = doc(collection(firestore, 'inventory'), editItem);
        await deleteDoc(oldDocRef);
  
        await addItem(itemName, parseInt(quantity), imageUrl);
  
        setEditItem('');
        setItemName('');
        setQuantity('');
        setImage(null);
        setImageUrl('');
        handleClose();
      }
    }
  };
  

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const storageRef = ref(storage, `images/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
        },
        (error) => {
          console.error("Error uploading image: ", error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setImageUrl(downloadURL);
            console.log("Image URL:", downloadURL);
          });
        }
      );
    }
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleAddOrEdit = async () => {
    if (editItem) {
      await handleEdit();
    } else {
      if (image) {
        const storageRef = ref(storage, `images/${image.name}`);
        const uploadTask = uploadBytesResumable(storageRef, image);
  
        uploadTask.on('state_changed',
          (snapshot) => {
          },
          (error) => {
            console.error("Error uploading image: ", error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setImageUrl(downloadURL);
            console.log("Image URL:", downloadURL);
            await addItem(itemName, parseInt(quantity), downloadURL);
            setItemName('');
            setQuantity('');
            setImage(null);
            setImageUrl('');
            handleClose();
          }
        );
      } else {
        await addItem(itemName, parseInt(quantity), imageUrl);
        setItemName('');
        setQuantity('');
        setImage(null);
        setImageUrl('');
        handleClose();
      }
    }
  };
  

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleDeleteOpen = () => setDeleteOpen(true);
  const handleDeleteClose = () => setDeleteOpen(false);

  return (
    <Box 
      width="100vw" 
      height="100vh" 
      display="flex" 
      justifyContent="center" 
      flexDirection="column"
      alignItems="center" 
      gap={2}
    >
      <Modal open={open} onClose={handleClose}>
        <Box 
          position="absolute" 
          top="50%" 
          left="50%" 
          sx={{ transform: 'translate(-50%, -50%)' }} 
          width={400} 
          bgcolor="white" 
          border="2px solid #000" 
          boxShadow={24} 
          p={4} 
          display="flex" 
          flexDirection="column" 
          gap={3}
        >
          <Typography variant="h6">{editItem ? 'Edit Item' : 'Add Item'}</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField 
              variant='outlined' 
              fullWidth 
              value={itemName} 
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Item Name"
            />
            <TextField 
              variant='outlined' 
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Quantity"
            />
            <Button 
              variant='outlined' 
              onClick={handleAddOrEdit}
            >
              {editItem ? 'Update' : 'Add'}
            </Button>
          </Stack>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </Box>
      </Modal>
  
      <Modal open={deleteOpen} onClose={handleDeleteClose}>
        <Box 
          position="absolute" 
          top="50%" 
          left="50%" 
          sx={{ transform: 'translate(-50%, -50%)' }} 
          width={400} 
          bgcolor="white" 
          border="2px solid #000" 
          boxShadow={24} 
          p={4} 
          display="flex" 
          flexDirection="column" 
          gap={3}
        >
          <Typography variant="h6">Do you want to delete this item?</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <Button 
              variant='contained' 
              color='error'
              onClick={() => {
                removeItem(editItem);
                handleDeleteClose();
              }}
            >
              Yes
            </Button>
            <Button 
              variant='contained' 
              onClick={handleDeleteClose}
            >
              No
            </Button>
          </Stack>
        </Box>
      </Modal>
  
      <Box 
        position="fixed" 
        bottom={20} 
        right={50} 
        display="flex" 
        justifyContent="center" 
        alignItems="center"
      >
        <Button
          variant="contained"
          sx={{ 
            backgroundColor: '#0A4D68', 
            color: '#FFF4DD', 
            borderRadius: '50%', 
            width: 60, 
            height: 60, 
            minWidth: 0, 
            padding: 0,
            boxShadow: 3,
            position: 'relative',
            '&:hover': {
              backgroundColor: '#084C61',
              boxShadow: 6,
              transform: 'scale(1.1)',
              '&::after': {
                content: '"Add New Item"',
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#0A4D68',
                color: '#FFF4DD',
                padding: '4px 8px',
                borderRadius: '4px',
                whiteSpace: 'nowrap',
                fontSize: '0.75rem',
                boxShadow: 3,
                opacity: 1,
                visibility: 'visible',
              },
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#0A4D68',
              color: '#FFF4DD',
              padding: '4px 8px',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
              fontSize: '0.75rem',
              boxShadow: 3,
              opacity: 0,
              visibility: 'hidden',
              transition: 'opacity 0.3s, visibility 0.3s',
            },
          }}
          onClick={() => {
            setEditItem('');
            setItemName('');
            setQuantity('');
            handleOpen();
          }}
        >
          <AddIcon />
        </Button>
      </Box>
  
      <Box border="1px solid #333">
        <Box width="800px" height="100px" bgcolor="#0A4D68" display="flex" alignItems="center" justifyContent="center">
          <Typography variant="h4" color="#FFF4DD" fontWeight="bold">Inventory Items</Typography>
        </Box>
        <Box width="800px" display="flex" justifyContent="space-between" alignItems="center" p={2}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }} color="black">Item Name</Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }} color="black">Quantity</Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }} color="black">Image</Typography>
          <Box width="130px" />
        </Box>
        <Divider />
        <Stack width="800px" height="300px" spacing={2} overflow="auto">
          {
            inventory.map(({name, quantity, imageUrl}) => (
              <div key={name}>
                <Box 
                  width="100%" 
                  height="10px" 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="space-between" 
                  padding={5}
                >
                  <Box width="200px">
                    <Typography variant="h6" color="#333">{name.charAt(0).toUpperCase() + name.slice(1)}</Typography>
                  </Box>
                  <Box width="200px">
                    <Typography variant="h6" textAlign="center">{quantity}</Typography>
                  </Box>
                  <Box width="200px" display="flex" justifyContent="center" alignItems="center">
                    {imageUrl && <img src={imageUrl} alt={name} width="50" height="50"/>}
                  </Box>   
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<EditIcon />} 
                      onClick={() => {
                        setEditItem(name);
                        setItemName(name);
                        setQuantity(quantity);
                        setImageUrl(imageUrl);
                        handleOpen();
                      }}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="small"
                      variant="contained"
                      color="error"
                      startIcon={<DeleteIcon />} 
                      onClick={() => {
                        setEditItem(name);
                        handleDeleteOpen();
                      }}
                    >
                      Delete
                    </Button>
                  </Stack>
                </Box>
                <Divider />
              </div>
            ))
          }
        </Stack>
      </Box>
    </Box>
  );
}

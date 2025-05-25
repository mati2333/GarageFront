// MyCars.js

import React, { useEffect, useState, useContext } from "react";
import { Container, Typography, Box, List, ListItem, ListItemText, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert } from "@mui/material";
import { Link, useNavigate } from "react-router-dom"; // Dodaj useNavigate
import { AuthContext } from "./AuthContext";
import api from "../api";

const MyCars = () => {
  const { user } = useContext(AuthContext);
  const [cars, setCars] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const navigate = useNavigate();

  // Pobierz samochody użytkownika
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await api.getMyCars();
        setCars(response.data);
      } catch (error) {
        console.error("Błąd podczas pobierania samochodów:", error);
        setSnackbarMessage("Błąd podczas pobierania samochodów");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    };

    if (user) {
      fetchCars();
    }
  }, [user]);

  // Obsługa edycji samochodu
  const handleEditClick = (car) => {
    setSelectedCar(car);
    setEditDialogOpen(true);
  };

  // Obsługa usuwania samochodu
  const handleDeleteClick = async (carId) => {
    try {
      await api.deleteCar(carId);
      setCars(cars.filter((car) => car.id !== carId)); // Usuń samochód z listy
      setSnackbarMessage("Samochód został usunięty");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Błąd podczas usuwania samochodu:", error);
      setSnackbarMessage("Błąd podczas usuwania samochodu");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // Obsługa zapisywania edycji samochodu
  const handleSaveEdit = async () => {
    try {
      const updatedCar = await api.updateCar(selectedCar.id, selectedCar);
      setCars(cars.map((car) => (car.id === updatedCar.data.id ? updatedCar.data : car))); // Zaktualizuj listę samochodów
      setEditDialogOpen(false);
      setSnackbarMessage("Samochód został zaktualizowany");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Błąd podczas aktualizacji samochodu:", error);
      setSnackbarMessage("Błąd podczas aktualizacji samochodu");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // Przekierowanie do historii napraw
  const handleViewRepairHistory = (carId) => {
    navigate(`/repair-history/${carId}`); // Przekieruj do historii napraw
  };

  // Zamknij Snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container>
      <Box sx={{ mt: 8, textAlign: "center" }}>
        <Typography variant="h4" component="h1">
          Moje samochody
        </Typography>
        <List>
          {cars.map((car) => (
            <ListItem key={car.id}>
              <ListItemText
                primary={`${car.brand} ${car.model} (${car.year})`}
                secondary={`VIN: ${car.vin}, Nr rej.: ${car.licensePlate}`}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleEditClick(car)}
                sx={{ mr: 2 }}
              >
                Edytuj
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleDeleteClick(car.id)}
                sx={{ mr: 2 }}
              >
                Usuń
              </Button>
              {/* Przycisk do wyświetlenia historii napraw */}
              <Button
                variant="contained"
                color="info"
                onClick={() => handleViewRepairHistory(car.id)}
              >
                Historia napraw
              </Button>
            </ListItem>
          ))}
        </List>
        {/* Przycisk "Dodaj nowy samochód" */}
        <Button
          variant="contained"
          component={Link}
          to="/add-car"
          sx={{ mt: 4 }}
        >
          Dodaj nowy samochód
        </Button>
      </Box>

      {/* Dialog do edycji samochodu */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edytuj samochód</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            fullWidth
            label="Marka"
            value={selectedCar?.brand || ""}
            onChange={(e) =>
              setSelectedCar({ ...selectedCar, brand: e.target.value })
            }
          />
          <TextField
            margin="normal"
            fullWidth
            label="Model"
            value={selectedCar?.model || ""}
            onChange={(e) =>
              setSelectedCar({ ...selectedCar, model: e.target.value })
            }
          />
          <TextField
            margin="normal"
            fullWidth
            label="Rok produkcji"
            value={selectedCar?.year || ""}
            onChange={(e) =>
              setSelectedCar({ ...selectedCar, year: e.target.value })
            }
          />
          <TextField
            margin="normal"
            fullWidth
            label="VIN"
            value={selectedCar?.vin || ""}
            onChange={(e) =>
              setSelectedCar({ ...selectedCar, vin: e.target.value })
            }
          />
          <TextField
            margin="normal"
            fullWidth
            label="Numer rejestracyjny"
            value={selectedCar?.licensePlate || ""}
            onChange={(e) =>
              setSelectedCar({ ...selectedCar, licensePlate: e.target.value })
            }
          />
          <TextField
            margin="normal"
            fullWidth
            label="Opis"
            value={selectedCar?.description || ""}
            onChange={(e) =>
              setSelectedCar({ ...selectedCar, description: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Anuluj</Button>
          <Button onClick={handleSaveEdit} color="primary">
            Zapisz
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar do wyświetlania komunikatów */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MyCars;
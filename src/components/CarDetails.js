import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Typography, Box, Button, Snackbar, Alert } from "@mui/material";
import api from "../api";

const CarDetails = () => {
  const { carId } = useParams(); 
  const [car, setCar] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const response = await api.getCarDetails(carId); 
        setCar(response.data);
      } catch (error) {
        console.error("Błąd podczas pobierania danych o samochodzie:", error);
        setSnackbarMessage("Błąd podczas pobierania danych o samochodzie");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    };

    fetchCarDetails();
  }, [carId]);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  if (!car) {
    return (
      <Container>
        <Box sx={{ mt: 8, textAlign: "center" }}>
          <Typography variant="h4" component="h1">
            Ładowanie danych...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mt: 8, textAlign: "center" }}>
        <Typography variant="h4" component="h1">
          Szczegóły samochodu
        </Typography>
        <Typography variant="body1" sx={{ mt: 4 }}>
          Marka: {car.brand}
        </Typography>
        <Typography variant="body1">
          Model: {car.model}
        </Typography>
        <Typography variant="body1">
          Rok produkcji: {car.year}
        </Typography>
        <Typography variant="body1">
          Numer VIN: {car.vin}
        </Typography>
        <Typography variant="body1">
          Numer rejestracyjny: {car.licensePlate}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.history.back()} 
          sx={{ mt: 4 }}
        >
          Powrót
        </Button>
      </Box>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CarDetails;
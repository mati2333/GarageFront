// AddCar.js

import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Container, Typography, Box, Alert } from "@mui/material";
import { AuthContext } from "./AuthContext";
import api from "../api";

const AddCar = () => {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [vin, setVin] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user) {
      navigate("/login"); 
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!brand || !model || !year || !vin || !licensePlate || !description) {
      setError("Wszystkie pola są wymagane");
      return;
    }

    try {
      const carData = {
        brand,
        model,
        year,
        vin,
        licensePlate,
        description,
      };

      await api.addCar(carData);
      navigate("/my-cars"); 
    } catch (err) {
      setError("Błąd podczas dodawania samochodu");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography component="h1" variant="h5">
          Dodaj samochód
        </Typography>
        {error && <Alert severity="error" sx={{ width: "100%", mt: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: "100%" }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Marka"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Rok produkcji"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="VIN"
            value={vin}
            onChange={(e) => setVin(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Numer rejestracyjny"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Opis"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Dodaj samochód
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default AddCar;
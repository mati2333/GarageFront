import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Typography, Box, Button, Select, MenuItem, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { AuthContext } from "./AuthContext";
import api from "../api";

const MechanicBooking = () => {
  const { mechanicId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [availability, setAvailability] = useState([]);
  const [selectedStartTime, setSelectedStartTime] = useState("");
  const [selectedServices, setSelectedServices] = useState([]);
  const [services, setServices] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [endTime, setEndTime] = useState("");

  
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const response = await api.getMechanicAvailability(mechanicId);
        const filteredAvailability = response.data.filter(slot => new Date(slot.startTime) >= new Date());
        setAvailability(filteredAvailability);
      } catch (error) {
        console.error("Błąd podczas pobierania dostępności:", error);
        setSnackbarMessage("Błąd podczas pobierania dostępności");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    };

    const fetchServices = async () => {
      try {
        const response = await api.getServices();
        setServices(response.data);
      } catch (error) {
        console.error("Błąd podczas pobierania usług:", error);
        setSnackbarMessage("Błąd podczas pobierania usług");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    };

    if (user) {
      fetchAvailability();
      fetchServices();
    }
  }, [mechanicId, user]);

  const handleServiceChange = (event) => {
    setSelectedServices(event.target.value);
  };

  
  const calculateEndTime = (startTime, services) => {
    const totalDuration = selectedServices.reduce((sum, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return sum + (service ? service.duration : 0);
    }, 0);
    const endTime = new Date(new Date(startTime).getTime() + totalDuration * 60000);
    return endTime.toISOString();
  };

  
  const generateAvailableTimeSlots = (startTime, endTime, services) => {
    const availableSlots = [];
    let start = new Date(startTime);
    const end = new Date(endTime);

    while (start < end) {
      const newEndTime = new Date(start.getTime() + services.reduce((sum, serviceId) => {
        const service = services.find(s => s.id === serviceId);
        return sum + (service ? service.duration : 0);
      }, 0) * 60000);

      if (newEndTime <= end) {
        availableSlots.push(new Date(start));
      }

      start.setMinutes(start.getMinutes() + 30); 
    }

    return availableSlots;
  };

  const handleBookAppointment = async () => {
    if (!selectedStartTime || selectedServices.length === 0) {
      setSnackbarMessage("Wybierz czas i usługi");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    // Oblicz czas zakończenia wizyty
    const endTime = calculateEndTime(selectedStartTime, services);
    setEndTime(endTime);

    // Otwórz dialog z potwierdzeniem
    setConfirmationDialogOpen(true);
  };

  const confirmAppointment = async () => {
    try {
      const response = await api.bookAppointment({
        mechanicId: parseInt(mechanicId, 10),
        startTime: selectedStartTime,
        endTime,
        serviceIds: selectedServices,
      });

      setSnackbarMessage("Wizyta zarezerwowana pomyślnie");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setConfirmationDialogOpen(false);
      navigate("/my-appointments");
    } catch (error) {
      console.error("Błąd podczas rezerwacji wizyty:", error);
      setSnackbarMessage(error.response?.data?.message || "Błąd podczas rezerwacji wizyty");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container>
      <Box sx={{ mt: 8, textAlign: "center" }}>
        <Typography variant="h4" component="h1">
          Rezerwacja wizyty u mechanika
        </Typography>
        <Box sx={{ mt: 4 }}>
  <Typography variant="h6">Wybierz dostępny termin:</Typography>
  <Select
    value={selectedStartTime}
    onChange={(e) => setSelectedStartTime(e.target.value)}
    fullWidth
    sx={{ mt: 2 }}
  >
    {availability.map((slot) => {
      const availableSlots = generateAvailableTimeSlots(slot.startTime, slot.endTime, services);
      return availableSlots.map((availableSlot, index) => (
        <MenuItem key={index} value={availableSlot.toISOString()}>
          {`${availableSlot.toLocaleDateString()} ${availableSlot.toLocaleTimeString()}`}
        </MenuItem>
      ));
    })}
  </Select>
</Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Wybierz usługi:</Typography>
          <Select
            multiple
            value={selectedServices}
            onChange={handleServiceChange}
            fullWidth
            sx={{ mt: 2 }}
          >
            {services.map((service) => (
              <MenuItem key={service.id} value={service.id}>
                {service.name} ({service.duration} minut)
              </MenuItem>
            ))}
          </Select>
        </Box>
        {selectedStartTime && selectedServices.length > 0 && (
          <Typography variant="body1" sx={{ mt: 2 }}>
            Czas zakończenia wizyty: {new Date(calculateEndTime(selectedStartTime, services)).toLocaleString()}
          </Typography>
        )}
        <Button
          variant="contained"
          onClick={handleBookAppointment}
          sx={{ mt: 4 }}
        >
          Zarezerwuj wizytę
        </Button>
      </Box>

      {/* Dialog z potwierdzeniem */}
      <Dialog open={confirmationDialogOpen} onClose={() => setConfirmationDialogOpen(false)}>
        <DialogTitle>Potwierdzenie rezerwacji</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Czy na pewno chcesz zarezerwować wizytę na:
          </Typography>
          <Typography variant="body1">
            {new Date(selectedStartTime).toLocaleString()} - {new Date(endTime).toLocaleTimeString()}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmationDialogOpen(false)}>Anuluj</Button>
          <Button onClick={confirmAppointment} color="primary">
            Potwierdź
          </Button>
        </DialogActions>
      </Dialog>

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

export default MechanicBooking;
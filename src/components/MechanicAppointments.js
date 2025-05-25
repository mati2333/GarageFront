import React, { useEffect, useState, useContext } from "react";
import { Container, Typography, Box, List, ListItem, ListItemText, Button, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api";

const MechanicAppointments = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [userCars, setUserCars] = useState([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await api.getMechanicAppointments();
        setAppointments(response.data);
      } catch (error) {
        console.error("Błąd podczas pobierania wizyt:", error);
        setSnackbarMessage("Błąd podczas pobierania wizyt");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    };

    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const handleViewUserCars = async (appointmentId) => {
    try {
      const response = await api.getUserCarsByAppointment(appointmentId);
      setUserCars(response.data);
      setSelectedAppointmentId(appointmentId);
      setDialogOpen(true);
    } catch (error) {
      console.error("Błąd podczas pobierania samochodów użytkownika:", error);
      setSnackbarMessage("Błąd podczas pobierania samochodów użytkownika");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleViewCarDetails = (carId, appointmentId) => {
    navigate(`/mechanic/car-details/${carId}`, { state: { appointmentId } });
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setUserCars([]);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container>
      <Box sx={{ mt: 8, textAlign: "center" }}>
        <Typography variant="h4" component="h1">
          Moje wizyty
        </Typography>
        {appointments.length === 0 ? (
          <Typography variant="body1" sx={{ mt: 4 }}>
            Brak wizyt do wyświetlenia.
          </Typography>
        ) : (
          <List>
            {appointments.map((appointment) => (
              <ListItem key={appointment.id}>
                <ListItemText
                  primary={`Właściciel: ${appointment.user?.username || "Brak danych"}`}
                  secondary={
                    <>
                      <Typography component="span" display="block">
                        Samochód:{" "}
                        {appointment.car
                          ? `${appointment.car.brand || "Brak marki"} ${appointment.car.model || "Brak modelu"} (${appointment.car.year || "Brak roku"})`
                          : "Brak danych o samochodzie"}
                      </Typography>
                      <Typography component="span" display="block">
                        Data: {new Date(appointment.startTime).toLocaleDateString()}
                      </Typography>
                      <Typography component="span" display="block">
                        Godzina: {new Date(appointment.startTime).toLocaleTimeString()} -{" "}
                        {new Date(appointment.endTime).toLocaleTimeString()}
                      </Typography>
                      <Typography component="span" display="block">
                        Status: {appointment.confirmed ? "Potwierdzona" : "Niepotwierdzona"}
                      </Typography>
                    </>
                  }
                />
                {appointment.confirmed && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleViewUserCars(appointment.id)}
                    sx={{ ml: 2 }}
                  >
                    Przeglądaj auta użytkownika
                  </Button>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Dialog do wyświetlania samochodów użytkownika */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Samochody użytkownika</DialogTitle>
        <DialogContent>
          <List>
            {userCars.map((car) => (
              <ListItem key={car.id}>
                <ListItemText
                  primary={`${car.brand} ${car.model} (${car.year})`}
                  secondary={`VIN: ${car.vin}, Nr rej.: ${car.licensePlate}`}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleViewCarDetails(car.id, selectedAppointmentId)}
                  sx={{ ml: 2 }}
                >
                  Szczegóły
                </Button>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Zamknij</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MechanicAppointments;


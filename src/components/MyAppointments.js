import React, { useEffect, useState, useContext } from "react";
import { Container, Typography, Box, List, ListItem, ListItemText, Button, Snackbar, Alert } from "@mui/material";
import { AuthContext } from "./AuthContext";
import api from "../api";

const MyAppointments = () => {
    const { user } = useContext(AuthContext);
    const [appointments, setAppointments] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await api.getUserAppointments();
                setAppointments(response.data);
            } catch (error) {
                console.error("Błąd podczas pobierania rezerwacji:", error);
                setSnackbarMessage("Błąd podczas pobierania rezerwacji");
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
            }
        };

        if (user) {
            fetchAppointments();
        }
    }, [user]);

    const handleCancelAppointment = async (id) => {
        try {
            await api.cancelAppointment(id);
            setAppointments(appointments.filter(appointment => appointment.id !== id));
            setSnackbarMessage("Rezerwacja została anulowana");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
        } catch (error) {
            console.error("Błąd podczas anulowania rezerwacji:", error);
            setSnackbarMessage("Błąd podczas anulowania rezerwacji");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    };

    const handleConfirmAppointment = async (id) => {
        try {
            await api.confirmAppointment(id);
            setAppointments(appointments.map(appointment =>
                appointment.id === id ? { ...appointment, confirmed: true } : appointment
            ));
            setSnackbarMessage("Rezerwacja została potwierdzona");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
        } catch (error) {
            console.error("Błąd podczas potwierdzania rezerwacji:", error);
            setSnackbarMessage("Błąd podczas potwierdzania rezerwacji");
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
                    Moje rezerwacje
                </Typography>
                <List>
                    {appointments.map((appointment) => (
                        <ListItem key={appointment.id}>
                            <ListItemText
                                primary={`Mechanik: ${appointment.mechanic.username}`}
                                secondary={
                                    <>
                                        <Typography component="span" display="block">
                                            Data: {new Date(appointment.startTime).toLocaleDateString()}
                                        </Typography>
                                        <Typography component="span" display="block">
                                            Godzina: {new Date(appointment.startTime).toLocaleTimeString()} - {new Date(appointment.endTime).toLocaleTimeString()}
                                        </Typography>
                                        <Typography component="span" display="block">
                                            Status: {appointment.confirmed ? "Potwierdzona" : "Niepotwierdzona"}
                                        </Typography>
                                    </>
                                }
                            />
                            {!appointment.confirmed && (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleConfirmAppointment(appointment.id)}
                                    sx={{ mr: 2 }}
                                >
                                    Potwierdź obecność
                                </Button>
                            )}
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={() => handleCancelAppointment(appointment.id)}
                            >
                                Anuluj
                            </Button>
                        </ListItem>
                    ))}
                </List>
            </Box>

            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default MyAppointments;
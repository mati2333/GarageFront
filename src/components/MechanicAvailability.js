import React, { useState, useContext, useEffect, useMemo } from "react";
import { AuthContext } from "./AuthContext";
import { Container, Typography, Box, Snackbar, Alert, Button, TextField, FormControlLabel, Checkbox } from "@mui/material";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

const localizer = momentLocalizer(moment);

const daysOfWeek = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];

const MechanicAvailability = () => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [startTime, setStartTime] = useState(moment().toISOString());
  const [endTime, setEndTime] = useState(moment().toISOString());
  const [availability, setAvailability] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAvailability();
    }
  }, [user]);

  
  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/mechanic/availability/my-availabilities", {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Błąd HTTP: ${response.status}`);
      }
      const data = await response.json();
      const events = data.map((avail) => ({
        id: avail.id,
        title: "Dostępność",
        start: new Date(avail.startTime),
        end: new Date(avail.endTime),
      }));
      setEvents(events);
    } catch (error) {
      console.error("Błąd podczas pobierania dostępności:", error);
      setSnackbarMessage(`Błąd podczas pobierania dostępności: ${error.message}`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  
  const handleSelectSlot = ({ start, end }) => {
    setSelectedEvent(null);
    setStartTime(moment(start).toISOString());
    setEndTime(moment(end).toISOString());
    setEditDialogOpen(true);
  };

  
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setStartTime(moment(event.start).toISOString());
    setEndTime(moment(event.end).toISOString());
    setEditDialogOpen(true);
  };

  
  const handleSaveAvailability = async () => {
    if (moment(startTime).isSameOrAfter(moment(endTime))) {
      setSnackbarMessage("Godzina rozpoczęcia musi być wcześniejsza niż godzina zakończenia");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      const method = selectedEvent ? "PUT" : "POST";
      const url = selectedEvent
        ? `http://localhost:8080/mechanic/availability/update/${selectedEvent.id}`
        : "http://localhost:8080/mechanic/availability/add";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify({
          startTime: moment(startTime).toISOString(),
          endTime: moment(endTime).toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Nie udało się zapisać dostępności");
      }

      setSnackbarMessage("Dostępność zapisana pomyślnie");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setEditDialogOpen(false);
      fetchAvailability();
    } catch (error) {
      console.error("Błąd podczas zapisywania dostępności:", error);
      setSnackbarMessage("Błąd podczas zapisywania dostępności");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // Usuń dostępność
  const handleDeleteAvailability = async () => {
    try {
      const response = await fetch(`http://localhost:8080/mechanic/availability/delete/${selectedEvent.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Nie udało się usunąć dostępności");
      }

      setSnackbarMessage("Dostępność usunięta pomyślnie");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setEditDialogOpen(false);
      fetchAvailability();
    } catch (error) {
      console.error("Błąd podczas usuwania dostępności:", error);
      setSnackbarMessage("Błąd podczas usuwania dostępności");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // Zamknij Snackbar (komunikat)
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Zamknij dialog
  const handleCloseDialog = () => {
    setEditDialogOpen(false);
    setSelectedEvent(null);
  };

  // Obsługa zmiany dnia w formularzu
  const handleDayChange = (day, isChecked) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: isChecked ? { startTime: "09:00", endTime: "17:00" } : null,
    }));
  };

  // Obsługa zmiany czasu w formularzu
  const handleTimeChange = (day, field, value) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  // Funkcja do obliczania najbliższej daty dla danego dnia tygodnia
  const getNextDateForDay = (day) => {
    const days = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];
    const dayIndex = days.indexOf(day);
    const today = new Date();
    const daysUntilNextDay = (dayIndex - today.getDay() + 7) % 7;
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntilNextDay);
    return nextDate;
  };

  // Obsługa zapisywania dostępności na 30 dni
  const handleSubmit30Days = async () => {
    try {
      const availabilitiesToSend = Object.entries(availability)
        .filter(([_, value]) => value !== null)
        .flatMap(([day, times]) => {
          const availabilities = [];
          let currentDate = getNextDateForDay(day);

          for (let i = 0; i < 4; i++) { // 4 tygodnie = 30 dni
            const startTime = new Date(currentDate);
            const [startHours, startMinutes] = times.startTime.split(":");
            startTime.setHours(startHours, startMinutes);

            const endTime = new Date(currentDate);
            const [endHours, endMinutes] = times.endTime.split(":");
            endTime.setHours(endHours, endMinutes);

            availabilities.push({
              startTime: startTime.toISOString(),
              endTime: endTime.toISOString(),
            });

            currentDate = new Date(currentDate);
            currentDate.setDate(currentDate.getDate() + 7); 
          }

          return availabilities;
        });

      for (const availability of availabilitiesToSend) {
        const response = await fetch("http://localhost:8080/mechanic/availability/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.accessToken}`,
          },
          body: JSON.stringify(availability),
        });

        if (!response.ok) {
          throw new Error("Nie udało się zapisać dostępności");
        }
      }

      setSnackbarMessage("Dostępność na 30 dni zapisana pomyślnie");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      fetchAvailability(); 
    } catch (error) {
      console.error("Błąd podczas zapisywania dostępności:", error);
      setSnackbarMessage("Błąd podczas zapisywania dostępności");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // Optymalizacja formatowania zdarzeń
  const formattedEvents = useMemo(() => {
    return events.map((event) => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
    }));
  }, [events]);

  return (
    <Container>
      <Box sx={{ mt: 8, textAlign: "center" }}>
        <Typography variant="h4" component="h1">
          Ustawianie dostępności
        </Typography>
        {user && (
          <>
            <Box sx={{ mt: 4 }}>
              <Calendar
                localizer={localizer}
                events={formattedEvents}
                startAccessor="start"
                endAccessor="end"
                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                defaultView="week"
                views={["week", "day"]}
                date={currentDate}
                onNavigate={setCurrentDate}
                style={{ height: 500 }}
              />
              <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
                <Button onClick={() => setCurrentDate(moment(currentDate).subtract(1, "week").toDate())}>
                  Poprzedni tydzień
                </Button>
                <Button onClick={() => setCurrentDate(moment(currentDate).add(1, "week").toDate())}>
                  Następny tydzień
                </Button>
              </Box>
            </Box>

            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" component="h2">
                Ustaw dostępność na najbliższe 30 dni
              </Typography>
              {daysOfWeek.map((day) => (
                <Box key={day} sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={!!availability[day]}
                        onChange={(e) => handleDayChange(day, e.target.checked)}
                      />
                    }
                    label={day}
                  />
                  {availability[day] && (
                    <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                      <TextField
                        label="Godzina rozpoczęcia"
                        type="time"
                        value={availability[day].startTime}
                        onChange={(e) => handleTimeChange(day, "startTime", e.target.value)}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                      <TextField
                        label="Godzina zakończenia"
                        type="time"
                        value={availability[day].endTime}
                        onChange={(e) => handleTimeChange(day, "endTime", e.target.value)}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Box>
                  )}
                </Box>
              ))}
              <Button variant="contained" onClick={handleSubmit30Days} sx={{ mt: 4 }}>
                Zapisz dostępność na 30 dni
              </Button>
            </Box>
          </>
        )}
      </Box>

      {/* Dialog do dodawania/edycji dostępności */}
      <Dialog open={editDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>{selectedEvent ? "Edytuj dostępność" : "Dodaj dostępność"}</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            fullWidth
            label="Data i godzina rozpoczęcia"
            type="datetime-local"
            value={moment(startTime).format("YYYY-MM-DDTHH:mm")}
            onChange={(e) => setStartTime(moment(e.target.value).toISOString())}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Data i godzina zakończenia"
            type="datetime-local"
            value={moment(endTime).format("YYYY-MM-DDTHH:mm")}
            onChange={(e) => setEndTime(moment(e.target.value).toISOString())}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Anuluj</Button>
          {selectedEvent && (
            <Button onClick={handleDeleteAvailability} color="secondary">
              Usuń
            </Button>
          )}
          <Button onClick={handleSaveAvailability} color="primary">
            Zapisz
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar do wyświetlania komunikatów */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MechanicAvailability;
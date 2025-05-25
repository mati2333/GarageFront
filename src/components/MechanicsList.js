import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { Container, Typography, Box, List, ListItem, ListItemText, Button } from "@mui/material";
import api from "../api";

const MechanicsList = () => {
  const { user } = useContext(AuthContext);
  const [mechanics, setMechanics] = useState([]);

  useEffect(() => {
    const fetchMechanics = async () => {
      try {
        const response = await api.getMechanicsWithAvailability();
        setMechanics(response.data);
      } catch (error) {
        console.error("Błąd podczas pobierania mechaników:", error);
      }
    };

    fetchMechanics();
  }, []);

  return (
    <Container>
      <Box sx={{ mt: 8, textAlign: "center" }}>
        <Typography variant="h4" component="h1">
          Lista mechaników
        </Typography>
        <List>
          {mechanics.map((mechanic) => (
            <ListItem key={mechanic.id}>
              <ListItemText
                primary={`${mechanic.username}`}
                secondary={
                  <>
                    <Typography component="span" display="block">
                      Telefon: {mechanic.phoneNumber || "Brak danych"}
                    </Typography>
                    <Typography component="span" display="block">
                      Dostępność: {mechanic.availabilities.length > 0 ? "Dostępny" : "Niedostępny"}
                    </Typography>
                  </>
                }
              />
              <Button
                variant="contained"
                component={Link}
                to={`/mechanic-availability/${mechanic.id}`}
              >
                Sprawdź dostępność
              </Button>
            </ListItem>
          ))}
        </List>
      </Box>
    </Container>
  );
};

export default MechanicsList;


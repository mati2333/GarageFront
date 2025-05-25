import React, { useContext } from "react";
import { AuthContext } from "./AuthContext";
import { Container, Typography, Box } from "@mui/material";

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <Container>
      <Box sx={{ mt: 8, textAlign: "center" }}>
        <Typography variant="h4" component="h1">
          Witaj w aplikacji Garage!
        </Typography>
        {user ? (
          <Typography variant="h6" sx={{ mt: 2 }}>
            Jesteś zalogowany jako <strong>{user.username}</strong>.
          </Typography>
        ) : (
          <Typography variant="h6" sx={{ mt: 2 }}>
            Zaloguj się lub zarejestruj, aby kontynuować.
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default Home;
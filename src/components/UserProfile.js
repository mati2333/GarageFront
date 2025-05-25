import React, { useContext } from "react";
import { AuthContext } from "./AuthContext";
import { Container, Typography, Box, Button } from "@mui/material";

const UserProfile = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <Container>
      <Box sx={{ mt: 8, textAlign: "center" }}>
        <Typography variant="h4" component="h1">
          Profil użytkownika
        </Typography>
        {user && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6">
              Nazwa użytkownika: <strong>{user.username}</strong>
            </Typography>
            <Typography variant="h6">
              Email: <strong>{user.email}</strong>
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={logout}
              sx={{ mt: 4 }}
            >
              Wyloguj się
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default UserProfile;
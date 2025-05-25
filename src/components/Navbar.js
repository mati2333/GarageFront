import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Box
          component={Link}
          to="/profile"
          sx={{
            flexGrow: 1,
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontFamily: "'Roboto', sans-serif",
              fontWeight: "bold",
              color: "white",
              textTransform: "uppercase",
              letterSpacing: "2px",
              "&:hover": {
                opacity: 0.8,
              },
            }}
          >
            GARAGE
          </Typography>
        </Box>
        {user ? (
          <Box>
            {user.roles.includes("ROLE_USER") && (
              <Button color="inherit" component={Link} to="/mechanics" sx={{ mr: 2 }}>
                Mechanicy
              </Button>
            )}
            {user.roles.includes("ROLE_USER") && (
              <Button color="inherit" component={Link} to="/add-car" sx={{ mr: 2 }}>
                Dodaj samochód
              </Button>
            )}
            {user.roles.includes("ROLE_USER") && (
              <Button color="inherit" component={Link} to="/my-cars" sx={{ mr: 2 }}>
                Moje samochody
              </Button>
            )}
            {user.roles.includes("ROLE_USER") && (
              <Button color="inherit" component={Link} to="/my-appointments" sx={{ mr: 2 }}>
                Moje rezerwacje
              </Button>
            )}
            {user.roles.includes("ROLE_MECHANIC") && (
              <Button color="inherit" component={Link} to="/availability" sx={{ mr: 2 }}>
                Ustaw dostępność
              </Button>
            )}
            {user.roles.includes("ROLE_MECHANIC") && (
              <Button color="inherit" component={Link} to="/mechanic/appointments" sx={{ mr: 2 }}>
                Moje wizyty
              </Button>
            )}
            <Button color="inherit" onClick={handleLogout}>
              Wyloguj się
            </Button>
          </Box>
        ) : (
          <Box>
            <Button color="inherit" component={Link} to="/login">
              Logowanie
            </Button>
            <Button color="inherit" component={Link} to="/register">
              Rejestracja
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
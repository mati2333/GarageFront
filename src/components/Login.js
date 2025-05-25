
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { TextField, Button, Container, Typography, Box, Alert } from "@mui/material";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Wszystkie pola są wymagane");
      return;
    }

    try {
      await login(username, password);
      navigate("/profile");
    } catch (err) {
      setError("Nieprawidłowe dane logowania");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography component="h1" variant="h5">
          Logowanie
        </Typography>
        {error && <Alert severity="error" sx={{ width: "100%", mt: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: "100%" }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Nazwa użytkownika"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError(""); // Resetowanie błędu podczas wpisywania
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Hasło"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(""); // Resetowanie błędu podczas wpisywania
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Zaloguj się
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
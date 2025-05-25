import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { TextField, Button, Container, Typography, Box, Alert, FormControlLabel, Checkbox } from "@mui/material";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isMechanic, setIsMechanic] = useState(false);
  const [workshopAddress, setWorkshopAddress] = useState("");
  const [error, setError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [workshopError, setWorkshopError] = useState("");
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  // Walidacja nazwy użytkownika
  const validateUsername = (username) => {
    if (!username) {
      return "Nazwa użytkownika jest wymagana.";
    }
    if (username.length < 3 || username.length > 20) {
      return "Nazwa użytkownika musi mieć od 3 do 20 znaków.";
    }
    return "";
  };

  // Walidacja emaila
  const validateEmail = (email) => {
    if (!email) {
      return "Email jest wymagany.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Nieprawidłowy adres email.";
    }
    return "";
  };

  // Walidacja hasła
  const validatePassword = (password) => {
    if (!password) {
      return "Hasło jest wymagane.";
    }
    if (password.length < 6 || password.length > 40) {
      return "Hasło musi mieć od 6 do 40 znaków.";
    }
    if (!/[A-Z]/.test(password)) {
      return "Hasło musi zawierać co najmniej jedną wielką literę.";
    }
    if (!/[!@#$%^&*()]/.test(password)) {
      return "Hasło musi zawierać co najmniej jeden znak specjalny (!@#$%^&*()).";
    }
    return "";
  };

  // Walidacja numeru telefonu
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[+\d\s-]{9,15}$/; // Dopuszczalne znaki: cyfry, +, -, spacje
    if (!phone) {
      return "Numer telefonu jest wymagany.";
    }
    if (!phoneRegex.test(phone)) {
      return "Numer telefonu może zawierać tylko cyfry, znak '+' oraz myślniki i musi mieć od 9 do 15 znaków.";
    }
    return "";
  };

  // Walidacja adresu warsztatu
  const validateWorkshopAddress = (address) => {
    if (isMechanic && !address) {
      return "Adres warsztatu jest wymagany.";
    }
    if (address && address.length > 255) {
      return "Adres warsztatu może mieć maksymalnie 255 znaków.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Sprawdź walidację wszystkich pól
    const usernameValidationError = validateUsername(username);
    const emailValidationError = validateEmail(email);
    const passwordValidationError = validatePassword(password);
    const phoneValidationError = validatePhoneNumber(phoneNumber);
    const workshopValidationError = validateWorkshopAddress(workshopAddress);

    // Ustaw błędy walidacji
    setUsernameError(usernameValidationError);
    setEmailError(emailValidationError);
    setPasswordError(passwordValidationError);
    setPhoneError(phoneValidationError);
    setWorkshopError(workshopValidationError);

    // Jeśli są błędy walidacji, zatrzymaj wysyłanie formularza
    if (usernameValidationError || emailValidationError || passwordValidationError || phoneValidationError || workshopValidationError) {
      return;
    }

    try {
      // Przekazujemy rolę mechanika, jeśli użytkownik ją wybrał
      const roles = isMechanic ? ["mechanic"] : ["user"];
      await register(username, email, password, roles, phoneNumber, isMechanic ? workshopAddress : null);
      navigate("/login");
    } catch (err) {
      setError("Rejestracja nie powiodła się");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography component="h1" variant="h5">
          Rejestracja
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
              setUsernameError(validateUsername(e.target.value));
              setError("");
            }}
            error={!!usernameError}
            helperText={usernameError}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError(validateEmail(e.target.value));
              setError("");
            }}
            error={!!emailError}
            helperText={emailError}
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
              setPasswordError(validatePassword(e.target.value));
              setError("");
            }}
            error={!!passwordError}
            helperText={passwordError}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Numer telefonu"
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value);
              setPhoneError(validatePhoneNumber(e.target.value));
              setError("");
            }}
            error={!!phoneError}
            helperText={phoneError}
          />
          {/* Pole wyboru dla roli mechanika */}
          <FormControlLabel
            control={
              <Checkbox
                checked={isMechanic}
                onChange={(e) => setIsMechanic(e.target.checked)}
                color="primary"
              />
            }
            label="Zarejestruj się jako mechanik"
          />
          {/* Pole adresu warsztatu (widoczne tylko dla mechaników) */}
          {isMechanic && (
            <TextField
              margin="normal"
              required
              fullWidth
              label="Adres warsztatu"
              value={workshopAddress}
              onChange={(e) => {
                setWorkshopAddress(e.target.value);
                setWorkshopError(validateWorkshopAddress(e.target.value));
                setError("");
              }}
              error={!!workshopError}
              helperText={workshopError}
            />
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Zarejestruj się
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;


import PaymentSuccess from "./components/PaymentSuccess";
import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./components/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import UserProfile from "./components/UserProfile";
import MechanicAvailability from "./components/MechanicAvailability";
import AddCar from "./components/AddCar";
import MyCars from "./components/MyCars";
import RepairHistory from "./components/RepairHistory";
import MechanicsList from "./components/MechanicsList";
import MyAppointments from "./components/MyAppointments";
import MechanicBooking from "./components/MechanicBooking";
import MechanicAppointments from "./components/MechanicAppointments";
import CarDetails from "./components/CarDetails";
import MechanicCarDetails from "./components/MechanicCarDetails";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Publiczne ścieżki */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Chronione ścieżki */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/availability"
            element={
              <ProtectedRoute requiredRoles={["ROLE_MECHANIC"]}>
                <MechanicAvailability />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-car"
            element={
              <ProtectedRoute requiredRoles={["ROLE_USER"]}>
                <AddCar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-cars"
            element={
              <ProtectedRoute requiredRoles={["ROLE_USER"]}>
                <MyCars />
              </ProtectedRoute>
            }
          />
          <Route
            path="/repair-history/:carId"
            element={
              <ProtectedRoute requiredRoles={["ROLE_USER"]}>
                <RepairHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mechanics"
            element={
              <ProtectedRoute requiredRoles={["ROLE_USER"]}>
                <MechanicsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-appointments"
            element={
              <ProtectedRoute requiredRoles={["ROLE_USER"]}>
                <MyAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mechanic-availability/:mechanicId"
            element={
              <ProtectedRoute requiredRoles={["ROLE_USER"]}>
                <MechanicBooking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mechanic/appointments"
            element={
              <ProtectedRoute requiredRoles={["ROLE_MECHANIC"]}>
                <MechanicAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/car-details/:carId"
            element={
              <ProtectedRoute requiredRoles={["ROLE_USER"]}>
                <CarDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mechanic/car-details/:carId"
            element={
              <ProtectedRoute requiredRoles={["ROLE_MECHANIC"]}>
                <MechanicCarDetails />
              </ProtectedRoute>
            }
          />
          {/* Strona sukcesu płatności */}
          <Route
          path="/payment/success"
          element={
            <ProtectedRoute>
              <PaymentSuccess />
            </ProtectedRoute>
          }
          />

          {/* Domyślna ścieżka dla nieznanych adresów */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

// Komponent ProtectedRoute do ochrony ścieżek
const ProtectedRoute = ({ children, requiredRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>; // Możesz dodać spinner ładowania
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRoles && !requiredRoles.some(role => user.roles.includes(role))) {
    return <Navigate to="/" />; // Przekieruj na stronę główną lub stronę błędu
  }

  return children;
};

export default App;


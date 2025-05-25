import axios from "axios";

const API_URL = "http://localhost:8080/api";

// Rejestracja użytkownika
const register = (username, email, password, roles, phoneNumber, workshopAddress) => {
  return axios.post(`${API_URL}/auth/signup`, {
    username,
    email,
    password,
    role: roles,
    phoneNumber: phoneNumber || "",
    workshopAddress: workshopAddress || null,
  });
};

// Logowanie użytkownika
const login = (username, password) => {
  return axios
    .post(`${API_URL}/auth/signin`, {
      username,
      password,
    })
    .then((response) => {
      if (response.data.accessToken) {
        localStorage.setItem("user", JSON.stringify(response.data));
      }
      return response.data;
    });
};

// Wylogowanie użytkownika
const logout = () => {
  localStorage.removeItem("user");
};

// Pobierz aktualnego użytkownika
const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

// Dodaj samochód
const addCar = (carData) => {
  const user = getCurrentUser();
  if (!user || !user.accessToken) {
    throw new Error("User is not authenticated");
  }

  return axios.post(`http://localhost:8080/user/cars/add`, carData, {
    headers: {
      Authorization: `Bearer ${user.accessToken}`,
    },
  });
};

// Pobierz listę samochodów użytkownika
const getMyCars = () => {
  const user = getCurrentUser();
  if (!user || !user.accessToken) {
    throw new Error("User is not authenticated");
  }

  return axios.get(`http://localhost:8080/user/cars/my-cars`, {
    headers: {
      Authorization: `Bearer ${user.accessToken}`,
    },
  });
};

// Aktualizuj samochód
const updateCar = (id, carData) => {
  const user = getCurrentUser();
  if (!user || !user.accessToken) {
    throw new Error("User is not authenticated");
  }

  return axios.put(`http://localhost:8080/user/cars/update/${id}`, carData, {
    headers: {
      Authorization: `Bearer ${user.accessToken}`,
    },
  });
};

// Usuń samochód
const deleteCar = (id) => {
  const user = getCurrentUser();
  if (!user || !user.accessToken) {
    throw new Error("User is not authenticated");
  }

  return axios.delete(`http://localhost:8080/user/cars/delete/${id}`, {
    headers: {
      Authorization: `Bearer ${user.accessToken}`,
    },
  });
};

// Pobierz historię napraw dla samochodu
const getRepairHistoryByCar = (carId) => {
  const user = getCurrentUser();
  if (!user || !user.accessToken) {
    throw new Error("User is not authenticated");
  }

  return axios.get(`http://localhost:8080/user/repairs/my-repairs/${carId}`, {
    headers: {
      Authorization: `Bearer ${user.accessToken}`,
    },
  });
};

// Pobierz dostępność mechanika
const getMechanicAvailability = (mechanicId) => {
  const user = getCurrentUser();
  if (!user || !user.accessToken) {
    throw new Error("User is not authenticated");
  }

  return axios.get(`${API_URL}/user/mechanic-availability/${mechanicId}`, {
    headers: {
      Authorization: `Bearer ${user.accessToken}`,
    },
  });
};

// Zarezerwuj wizytę
export const bookAppointment = async (appointmentData) => {
  const user = getCurrentUser();
  if (!user || !user.accessToken) {
    throw new Error("User is not authenticated");
  }

  try {
    const response = await axios.post(
      `http://localhost:8080/user/appointments/book`,
      appointmentData,
      {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error booking appointment:", error);
    throw error;
  }
};

// Pobierz listę mechaników z dostępnością
const getMechanicsWithAvailability = () => {
  const user = getCurrentUser();
  if (!user || !user.accessToken) {
    throw new Error("User is not authenticated");
  }

  return axios.get(`${API_URL}/user/mechanics-with-availability`, {
    headers: {
      Authorization: `Bearer ${user.accessToken}`,
    },
  });
};

// Aktualizuj dostępność mechanika
const updateMechanicAvailability = (availabilityId, startTime, endTime) => {
  const user = getCurrentUser();
  if (!user || !user.accessToken) {
    throw new Error("User is not authenticated");
  }

  return axios.put(
    `${API_URL}/mechanic/availability/update/${availabilityId}`,
    { startTime, endTime },
    {
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
      },
    }
  );
};

// Usuń dostępność mechanika
const deleteMechanicAvailability = (availabilityId) => {
  const user = getCurrentUser();
  if (!user || !user.accessToken) {
    throw new Error("User is not authenticated");
  }

  return axios.delete(`${API_URL}/mechanic/availability/delete/${availabilityId}`, {
    headers: {
      Authorization: `Bearer ${user.accessToken}`,
    },
  });
};

// Pobierz listę wizyt użytkownika
const getUserAppointments = () => {
  const user = getCurrentUser();
  if (!user || !user.accessToken) {
    throw new Error("User is not authenticated");
  }

  return axios.get(`http://localhost:8080/user/appointments/my-appointments`, {
    headers: {
      Authorization: `Bearer ${user.accessToken}`,
    },
  });
};

// Anuluj wizytę
const cancelAppointment = (appointmentId) => {
  const user = getCurrentUser();
  if (!user || !user.accessToken) {
    throw new Error("User is not authenticated");
  }

  return axios.delete(`http://localhost:8080/user/appointments/cancel/${appointmentId}`, {
    headers: {
      Authorization: `Bearer ${user.accessToken}`,
    },
  });
};

// Pobierz szczegóły wizyty
const getAppointmentDetails = (appointmentId) => {
  const user = getCurrentUser();
  if (!user || !user.accessToken) {
    throw new Error("User is not authenticated");
  }

  return axios.get(`${API_URL}/user/appointments/${appointmentId}`, {
    headers: {
      Authorization: `Bearer ${user.accessToken}`,
    },
  });
};

// Dodaj naprawę
const addRepair = (appointmentId, carId, description, cost, usedParts) => {
  const user = getCurrentUser();
  if (!user || !user.accessToken) {
    throw new Error("User is not authenticated");
  }

  return axios.post(
    `http://localhost:8080/mechanic/repairs/add`,
    { appointmentId, carId, description, cost, usedParts },
    {
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
      },
    }
  );
};

// Potwierdź wizytę
const confirmAppointment = (appointmentId) => {
  const user = getCurrentUser();
  if (!user || !user.accessToken) {
    throw new Error("User is not authenticated");
  }

  return axios.put(
    `http://localhost:8080/user/appointments/confirm/${appointmentId}`,
    null,
    {
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
      },
    }
  );
};

// Pobierz listę usług
const getServices = () => {
  const user = getCurrentUser();
  if (!user || !user.accessToken) {
    throw new Error("User is not authenticated");
  }

  return axios.get(`http://localhost:8080/user/appointments/service`, {
    headers: {
      Authorization: `Bearer ${user.accessToken}`,
    },
  });
};

// Pobierz listę wizyt mechanika
const getMechanicAppointments = () => {
  const user = getCurrentUser();
  if (!user || !user.accessToken) {
    throw new Error("User is not authenticated");
  }

  return axios.get(`http://localhost:8080/user/appointments/mechanic/appointments`, {
    headers: {
      Authorization: `Bearer ${user.accessToken}`,
    },
  });
};

// Pobierz szczegóły samochodu
const getCarDetails = (carId) => {
  const user = getCurrentUser();
  if (!user || !user.accessToken) {
    throw new Error("User is not authenticated");
  }

  return axios.get(`${API_URL}/cars/${carId}`, {
    headers: {
      Authorization: `Bearer ${user.accessToken}`,
    },
  });
};

// Pobierz samochody użytkownika przypisane do wizyty
const getUserCarsByAppointment = (appointmentId) => {
  const user = getCurrentUser();
  if (!user || !user.accessToken) {
    throw new Error("User is not authenticated");
  }

  return axios.get(`http://localhost:8080/user/appointments/${appointmentId}/user-cars`, {
    headers: {
      Authorization: `Bearer ${user.accessToken}`,
    },
  });
};

// Pobierz szczegóły samochodu dla mechanika
const getCarDetailsForMechanic = (carId) => {
  const user = getCurrentUser();
  if (!user || !user.accessToken) {
    throw new Error("User is not authenticated");
  }

  return axios.get(`http://localhost:8080/user/cars/mechanic/car-details/${carId}`, {
    headers: {
      Authorization: `Bearer ${user.accessToken}`,
    },
  });
};

// Pobierz użyte części w naprawie
const getUsedPartsByRepair = (repairId) => {
  const user = getCurrentUser();
  if (!user || !user.accessToken) {
    throw new Error("User is not authenticated");
  }

  return axios.get(`http://localhost:8080/mechanic/repairs/${repairId}/used-parts`, {
    headers: {
      Authorization: `Bearer ${user.accessToken}`,
    },
  });
};

const createPayment = async (repairId) => {
  try {
    const user = getCurrentUser();  // Pobierz bieżącego użytkownika
    if (!user || !user.accessToken) {
      throw new Error("User is not authenticated");
    }

    // Wykonaj żądanie do API do stworzenia płatności
    const response = await axios.post(
      "http://localhost:8080/payment/create", 
      null, // Brak treści w ciele żądania
      {
        headers: {
          Authorization: `Bearer ${user.accessToken}`, // Nagłówek autoryzacji
        },
        params: { repairId },  // Przekazywanie repairId jako parametr w URL
      }
    );

    // Sprawdzenie odpowiedzi
    if (response.status !== 200) {
      throw new Error("Failed to create payment");
    }

    // Zwróć dane płatności z odpowiedzi
    return response.data;
  } catch (error) {
    console.error("Błąd podczas tworzenia płatności:", error.message || error);
    throw new Error("Błąd podczas tworzenia płatności");
  }
};


// const createPayment = async (repairId) => {
//   try {
//     const user = getCurrentUser();  // Pobierz bieżącego użytkownika
//     if (!user || !user.accessToken) {
//       throw new Error("User is not authenticated");
//     }

    
//     const response = await axios.post(
//       "http://localhost:8080/payment/create", 
//       null, // Brak treści, parametr w URL
//       {
//         headers: {
//           Authorization: `Bearer ${user.accessToken}`,
//         },
//         params: { repairId }, 
//       }
//     );

//     if (response.status !== 200) {
//       throw new Error("Failed to create payment");
//     }

//     return response.data;  // Zwróć dane z odpowiedzi
//   } catch (error) {
//     console.error("Błąd podczas tworzenia płatności:", error.message || error);
//     throw new Error("Błąd podczas tworzenia płatności");
//   }
// };


// Update payment status
const updateRepairPaymentStatus = async (repairId, status) => {
  try {
    const user = getCurrentUser();
    if (!user || !user.accessToken) {
      throw new Error("User is not authenticated");
    }
    await axios.put(`http://localhost:8080/payment/update-payment-status/${repairId}`, null, {
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
      },
      params: { status }
    });
  } catch (error) {
    console.error("Błąd podczas aktualizacji statusu płatności:", error);
    throw new Error("Błąd podczas aktualizacji statusu płatności");
  }
};

// Get repair history for the car
// const getRepairHistoryByCar = async (carId) => {
//   try {
//     const response = await axios.get(`http://localhost:8080/user/repairs/my-repairs/${carId}}`);
//     return response.data;
//   } catch (error) {
//     console.error("Błąd podczas pobierania historii napraw:", error);
//     throw new Error("Błąd podczas pobierania historii napraw");
//   }
// };

export default {
  register,
  login,
  logout,
  getCurrentUser,
  addCar,
  getMyCars,
  updateCar,
  deleteCar,
  getRepairHistoryByCar,
  getMechanicAvailability,
  bookAppointment,
  getMechanicsWithAvailability,
  updateMechanicAvailability,
  deleteMechanicAvailability,
  getUserAppointments,
  cancelAppointment,
  getAppointmentDetails,
  addRepair,
  confirmAppointment,
  getServices,
  getMechanicAppointments,
  getCarDetails,
  getUserCarsByAppointment,
  getCarDetailsForMechanic,
  getUsedPartsByRepair,
  updateRepairPaymentStatus,
  createPayment,
};


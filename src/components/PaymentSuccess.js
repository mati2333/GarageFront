import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { AuthContext } from "./AuthContext";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [repairId, setRepairId] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const paymentId = queryParams.get("paymentId");
    const token = queryParams.get("token");
    const payerId = queryParams.get("PayerID");

    // Pobieramy repairId z sessionStorage lub localStorage
    const repairIdFromStorage = sessionStorage.getItem("repairId") || localStorage.getItem("repairId");

    if (!paymentId || !token || !payerId || !repairIdFromStorage) {
      setPaymentStatus("Brak wymaganych danych płatności.");
      setLoading(false);
      return;
    }

    setRepairId(repairIdFromStorage);

    const verifyPayment = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/payment/success?paymentId=${paymentId}&token=${token}&PayerID=${payerId}`
        );

        if (!response.ok) throw new Error("Płatność nie została zatwierdzona.");

        if (!user || !user.accessToken) {
          throw new Error("Użytkownik nie jest zalogowany. Nie można zaktualizować statusu płatności.");
        }

        // const updateResponse = await fetch(
        //   `http://localhost:8080/payment/update-payment-status/${repairIdFromStorage}?status=Paid`,
        //   {
        //     method: "PUT",
        //     headers: {
        //       Authorization: `Bearer ${user.accessToken}`,
        //       "Content-Type": "application/json",
        //     },
        //   }
        // );

        // if (!updateResponse.ok) throw new Error("Nie udało się zaktualizować statusu płatności.");

        setPaymentStatus("Płatność zakończona pomyślnie!");
      } catch (error) {
        setPaymentStatus(error.message || "Błąd podczas komunikacji z serwerem.");
      } finally {
        setLoading(false);
        setTimeout(() => navigate("/repair-history"), 3000);
      }
    };

    verifyPayment();
  }, [location.search, navigate]);

  return (
    <Box sx={{ textAlign: "center", mt: 10 }}>
      {loading ? (
        <>
          <CircularProgress size={50} />
          <Typography variant="h6" sx={{ mt: 2 }}>Trwa weryfikacja płatności...</Typography>
        </>
      ) : (
        <>
          <Typography variant="h4" component="h1">{paymentStatus}</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/dashboard")}
            sx={{ mt: 3 }}
          >
            Powróć do aplikacji
          </Button>
        </>
      )}
    </Box>
  );
};

export default PaymentSuccess;




// import React, { useEffect, useState, useContext } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { Box, Typography, Button, CircularProgress } from "@mui/material";
// import { AuthContext } from "./AuthContext"; // Import kontekstu autoryzacji

// const PaymentSuccess = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { user } = useContext(AuthContext); // Pobranie usera z kontekstu
//   const [loading, setLoading] = useState(true);
//   const [paymentStatus, setPaymentStatus] = useState(null);
//   const [selectedRepairId, setSelectedRepairId] = useState(null); // Id naprawy

//   useEffect(() => {
//     const queryParams = new URLSearchParams(location.search);
//     const paymentId = queryParams.get("paymentId");
//     const token = queryParams.get("token");
//     const payerId = queryParams.get("PayerID");

//     // Sprawdzenie, czy wszystkie wymagane dane są dostępne
//     if (!paymentId || !token || !payerId) {
//       setPaymentStatus("Brak wymaganych danych płatności.");
//       setLoading(false);
//       return;
//     }

//     const verifyPayment = async () => {
//       try {
//         // Wysyłanie zapytania w celu weryfikacji płatności
//         const response = await fetch(
//           `http://localhost:8080/payment/success?paymentId=${paymentId}&token=${token}&PayerID=${payerId}`,
//           {
//             method: "GET",
//             headers: {
//               "Content-Type": "application/json",
//             },
//           }
//         );

//         let data;
//         try {
//           data = await response.json();
//         } catch {
//           data = {}; // Jeśli odpowiedź nie jest JSON-em, ustaw pusty obiekt
//         }

//         // Jeśli odpowiedź jest ok, zaktualizuj status płatności w backendzie
//         if (response.ok) {
//           // Zaktualizowanie statusu naprawy na "Paid"
//           await fetch(`http://localhost:8080/repair/update-payment-status`, {
//             method: "POST",
//             headers: {
//               "Authorization": `Bearer ${user.accessToken}`, // Użycie tokenu użytkownika
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({ repairId: selectedRepairId, status: "Paid" }),
//           });

//           setPaymentStatus("Płatność zakończona pomyślnie!");
//         } else {
//           setPaymentStatus(data.message || "Płatność nie została zatwierdzona.");
//         }
//       } catch (error) {
//         setPaymentStatus("Błąd podczas komunikacji z serwerem.");
//       } finally {
//         setLoading(false);
//         setTimeout(() => {
//           navigate("/repair-history"); 
//         }, 3000); 
//       }
//     };

//     verifyPayment();
//   }, [location.search, navigate, user, selectedRepairId]); 

//   return (
//     <Box sx={{ textAlign: "center", mt: 10 }}>
//       {loading ? (
//         <>
//           <CircularProgress size={50} />
//           <Typography variant="h6" sx={{ mt: 2 }}>
//             Trwa weryfikacja płatności...
//           </Typography>
//         </>
//       ) : (
//         <>
//           <Typography variant="h4" component="h1">
//             {paymentStatus}
//           </Typography>
//           <Button
//             variant="contained"
//             color="primary"
//             onClick={() => navigate("/dashboard")}
//             sx={{ mt: 3 }}
//           >
//             Powróć do aplikacji
//           </Button>
//         </>
//       )}
//     </Box>
//   );
// };

// export default PaymentSuccess;


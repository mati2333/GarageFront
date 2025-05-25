import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import { AuthContext } from "./AuthContext";
import api from "../api";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

const RepairHistory = () => {
  const { carId } = useParams();
  const { user } = useContext(AuthContext);
  const [repairs, setRepairs] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [openPartsDialog, setOpenPartsDialog] = useState(false);
  const [usedParts, setUsedParts] = useState([]);
  const [selectedRepairId, setSelectedRepairId] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const navigate = useNavigate();

  // Pobierz historię napraw dla danego samochodu
  useEffect(() => {
    const fetchRepairs = async () => {
      try {
        const response = await api.getRepairHistoryByCar(carId);
        setRepairs(response.data);
      } catch (error) {
        console.error("Błąd podczas pobierania historii napraw:", error);
        setSnackbarMessage("Błąd podczas pobierania historii napraw");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    };

    if (user) {
      fetchRepairs();
    }
  }, [carId, user]);

  // Funkcja do pobierania części użytych w naprawie
  const fetchUsedParts = async (repairId) => {
    try {
      const response = await api.getUsedPartsByRepair(repairId);
      setUsedParts(response.data);
      setOpenPartsDialog(true);
    } catch (error) {
      console.error("Błąd podczas pobierania części:", error);
      setSnackbarMessage("Błąd podczas pobierania części");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // const handlePayPalPayment = async (repairId) => {
  //   setSelectedRepairId(repairId);
  //   const repair = repairs.find(r => r.id === repairId);
  
  //   try {
  //     const response = await fetch(`http://localhost:8080/payment/create?repairId=${repairId}`, {
  //       method: "POST",
  //       headers: {
  //         "Authorization": `Bearer ${user.accessToken}`,
  //         "Content-Type": "application/json"
  //       }
  //     });
  
  //     if (response.ok) {
  //       const paymentLink = await response.text();
  //       if (paymentLink && paymentLink.startsWith("http")) {
  //         window.location.href = paymentLink; // Przekierowanie do PayPal
  //       } else {
  //         throw new Error("Niepoprawny link do płatności");
  //       }
  //     } else {
  //       throw new Error("Błąd podczas tworzenia płatności PayPal");
  //     }
  //   } catch (error) {
  //     console.error("Błąd podczas tworzenia płatności PayPal:", error);
  //     setSnackbarMessage("Błąd podczas tworzenia płatności PayPal");
  //     setSnackbarSeverity("error");
  //     setSnackbarOpen(true);
  //   }
  // };

  const handlePayPalPayment = async (repairId) => {
    try {
      sessionStorage.setItem("repairId", repairId);
  
      const response = await fetch(`http://localhost:8080/payment/create?repairId=${repairId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) throw new Error("Błąd podczas tworzenia płatności PayPal");
  
      const paymentLink = await response.text();
      if (!paymentLink.startsWith("http")) throw new Error("Niepoprawny link do płatności");
  
      window.location.href = paymentLink;
    } catch (error) {
      console.error("Błąd:", error);
      setSnackbarMessage(error.message);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };
  
  

  const handlePaymentSuccess = async (repairId) => {
    try {
      // Zaktualizowanie statusu naprawy na 'Paid' w backendzie
      await api.updateRepairPaymentStatus(repairId, "Paid");

      // Aktualizowanie statusu na frontendzie
      setRepairs(repairs.map(repair =>
        repair.id === repairId ? { ...repair, paymentStatus: "Paid" } : repair
      ));

      setPaymentSuccess(true);
      setPaymentMessage("Płatność zakończona pomyślnie!");

      // Po 3 sekundach przekierowanie
      setTimeout(() => {
        navigate("/repair-history"); // Powróć do strony historii napraw
      }, 3000);
    } catch (error) {
      console.error("Błąd podczas aktualizacji statusu płatności:", error);
      setSnackbarMessage("Błąd podczas aktualizacji statusu płatności");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // Zamknij Snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Zamknij dialog z częściami
  const handleClosePartsDialog = () => {
    setOpenPartsDialog(false);
    setUsedParts([]);
  };

  return (
    <PayPalScriptProvider options={{ "client-id": "AWE9heEkzw-fio0xcHKWE_nLlLRHCssiOrA4Q1EzOQpgGNDH_cE1fwgN4-CZPVkIWUq_2ct1kyNrEdKP" }}>
      <Container>
        <Box sx={{ mt: 8, textAlign: "center" }}>
          <Typography variant="h4" component="h1">
            Historia napraw
          </Typography>

          {/* Komunikat o pomyślnej płatności */}
          {paymentSuccess && (
            <Box sx={{
              position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              backgroundColor: "green", padding: 2, borderRadius: 2, boxShadow: 3, zIndex: 9999
            }}>
              <Typography variant="h4" color="white">{paymentMessage}</Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate("/repair-history")}
                sx={{ mt: 2 }}
              >
                Powróć do historii napraw
              </Button>
            </Box>
          )}

          <List>
            {repairs.map((repair) => (
              <ListItem key={repair.id}>
                <ListItemText
                  primary={`Opis: ${repair.description}`}
                  secondary={`Koszt: ${repair.cost} PLN, Data: ${new Date(repair.completionDate).toLocaleDateString()}, Status płatności: ${repair.paymentStatus || "Not Paid"}`}
                />
                <Button
                  variant="contained"
                  onClick={() => fetchUsedParts(repair.id)}
                  sx={{ ml: 2 }}
                >
                  Przeglądaj części
                </Button>
                {repair.paymentStatus !== "Paid" && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handlePayPalPayment(repair.id)}
                    sx={{ ml: 2 }}
                  >
                    Zapłać przez PayPal
                  </Button>
                )}
              </ListItem>
            ))}
          </List>
          <Button variant="contained" onClick={() => navigate("/my-cars")} sx={{ mt: 4 }}>
            Powrót do listy samochodów
          </Button>
        </Box>

        {/* Dialog do wyświetlania części użytych w naprawie */}
        <Dialog open={openPartsDialog} onClose={handleClosePartsDialog}>
          <DialogTitle>Części użyte w naprawie</DialogTitle>
          <DialogContent>
            <List>
              {usedParts.map((part) => (
                <ListItem key={part.id}>
                  <ListItemText
                    primary={`Nazwa: ${part.partName}, Numer: ${part.partNumber}`}
                    secondary={`Koszt: ${part.partCost} PLN, Przebieg: ${part.mileageAtRepair} km`}
                  />
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePartsDialog} color="primary">Zamknij</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </PayPalScriptProvider>
  );
};

export default RepairHistory;



// import React, { useEffect, useState, useContext } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   Container,
//   Typography,
//   Box,
//   List,
//   ListItem,
//   ListItemText,
//   Button,
//   Snackbar,
//   Alert,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions
// } from "@mui/material";
// import { AuthContext } from "./AuthContext";
// import api from "../api";
// import { PayPalScriptProvider } from "@paypal/react-paypal-js";

// const RepairHistory = () => {
//   const { carId } = useParams();
//   const { user } = useContext(AuthContext);
//   const [repairs, setRepairs] = useState([]);
//   const [snackbarOpen, setSnackbarOpen] = useState(false);
//   const [snackbarMessage, setSnackbarMessage] = useState("");
//   const [snackbarSeverity, setSnackbarSeverity] = useState("success");
//   const [openPartsDialog, setOpenPartsDialog] = useState(false);
//   const [usedParts, setUsedParts] = useState([]);
//   const [selectedRepairId, setSelectedRepairId] = useState(null);
//   const [paymentSuccess, setPaymentSuccess] = useState(false); // Nowy stan do przechowywania statusu płatności
//   const navigate = useNavigate();

//   // Pobierz historię napraw dla danego samochodu
//   useEffect(() => {
//     const fetchRepairs = async () => {
//       try {
//         const response = await api.getRepairHistoryByCar(carId);
//         setRepairs(response.data);
//       } catch (error) {
//         console.error("Błąd podczas pobierania historii napraw:", error);
//         setSnackbarMessage("Błąd podczas pobierania historii napraw");
//         setSnackbarSeverity("error");
//         setSnackbarOpen(true);
//       }
//     };

//     if (user) {
//       fetchRepairs();
//     }
//   }, [carId, user]);

//   // Funkcja do pobierania części użytych w naprawie
//   const fetchUsedParts = async (repairId) => {
//     try {
//       const response = await api.getUsedPartsByRepair(repairId);
//       setUsedParts(response.data);
//       setOpenPartsDialog(true);
//     } catch (error) {
//       console.error("Błąd podczas pobierania części:", error);
//       setSnackbarMessage("Błąd podczas pobierania części");
//       setSnackbarSeverity("error");
//       setSnackbarOpen(true);
//     }
//   };

//   const handlePayPalPayment = async (repairId) => {
//     setSelectedRepairId(repairId);
//     const repair = repairs.find(r => r.id === repairId);

//     try {
//       const response = await fetch(`http://localhost:8080/payment/create?repairId=${repairId}`, {
//         method: "POST",
//         headers: {
//           "Authorization": `Bearer ${user.accessToken}`,
//           "Content-Type": "application/json"
//         }
//       });

//       if (response.ok) {
//         const paymentLink = await response.text(); // Odczytujemy odpowiedź jako tekst
//         if (paymentLink && paymentLink.startsWith("http")) {
//           // Jeśli odpowiedź jest poprawnym linkiem, przekierowujemy na PayPal
//           window.location.href = paymentLink;
//         } else {
//           throw new Error("Niepoprawny link do płatności");
//         }
//       } else {
//         throw new Error("Błąd podczas tworzenia płatności PayPal");
//       }
//     } catch (error) {
//       console.error("Błąd podczas tworzenia płatności PayPal:", error);
//       setSnackbarMessage("Błąd podczas tworzenia płatności PayPal");
//       setSnackbarSeverity("error");
//       setSnackbarOpen(true);
//     }
//   };

//   // Funkcja po pomyślnej płatności
//   const handlePaymentSuccess = async (repairId) => {
//     try {
//       await api.updateRepairPaymentStatus(repairId, "Paid");
//       setRepairs(repairs.map(repair =>
//         repair.id === repairId ? { ...repair, paymentStatus: "Paid" } : repair
//       ));
//       setPaymentSuccess(true); // Ustawienie statusu płatności na sukces
//     } catch (error) {
//       console.error("Błąd podczas aktualizacji statusu płatności:", error);
//       setSnackbarMessage("Błąd podczas aktualizacji statusu płatności");
//       setSnackbarSeverity("error");
//       setSnackbarOpen(true);
//     }
//   };

//   // Zamknij Snackbar
//   const handleCloseSnackbar = () => {
//     setSnackbarOpen(false);
//   };

//   // Zamknij dialog z częściami
//   const handleClosePartsDialog = () => {
//     setOpenPartsDialog(false);
//     setUsedParts([]);
//   };

//   return (
//     <PayPalScriptProvider options={{ "client-id": "AWE9heEkzw-fio0xcHKWE_nLlLRHCssiOrA4Q1EzOQpgGNDH_cE1fwgN4-CZPVkIWUq_2ct1kyNrEdKP" }}>
//       <Container>
//         <Box sx={{ mt: 8, textAlign: "center" }}>
//           <Typography variant="h4" component="h1">
//             Historia napraw
//           </Typography>
//           {paymentSuccess && (
//             <Box sx={{
//               position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
//               backgroundColor: "green", padding: 2, borderRadius: 2, boxShadow: 3
//             }}>
//               <Typography variant="h6" color="white">Płatność zakończona pomyślnie!</Typography>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 onClick={() => navigate("/repair-history")}
//                 sx={{ mt: 2 }}
//               >
//                 Powróć do historii napraw
//               </Button>
//             </Box>
//           )}
//           <List>
//             {repairs.map((repair) => (
//               <ListItem key={repair.id}>
//                 <ListItemText
//                   primary={`Opis: ${repair.description}`}
//                   secondary={`Koszt: ${repair.cost} PLN, Data: ${new Date(repair.completionDate).toLocaleDateString()}, Status płatności: ${repair.paymentStatus || "Not Paid"}`}
//                 />
//                 <Button
//                   variant="contained"
//                   onClick={() => fetchUsedParts(repair.id)}
//                   sx={{ ml: 2 }}
//                 >
//                   Przeglądaj części
//                 </Button>
//                 {repair.paymentStatus !== "Paid" && (
//                   <Button
//                     variant="contained"
//                     color="primary"
//                     onClick={() => handlePayPalPayment(repair.id)}
//                     sx={{ ml: 2 }}
//                   >
//                     Zapłać przez PayPal
//                   </Button>
//                 )}
//               </ListItem>
//             ))}
//           </List>
//           <Button variant="contained" onClick={() => navigate("/my-cars")} sx={{ mt: 4 }}>
//             Powrót do listy samochodów
//           </Button>
//         </Box>

//         {/* Dialog do wyświetlania części użytych w naprawie */}
//         <Dialog open={openPartsDialog} onClose={handleClosePartsDialog}>
//           <DialogTitle>Części użyte w naprawie</DialogTitle>
//           <DialogContent>
//             <List>
//               {usedParts.map((part) => (
//                 <ListItem key={part.id}>
//                   <ListItemText
//                     primary={`Nazwa: ${part.partName}, Numer: ${part.partNumber}`}
//                     secondary={`Koszt: ${part.partCost} PLN, Przebieg: ${part.mileageAtRepair} km`}
//                   />
//                 </ListItem>
//               ))}
//             </List>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={handleClosePartsDialog}>Zamknij</Button>
//           </DialogActions>
//         </Dialog>

//         {/* Snackbar do wyświetlania komunikatów */}
//         <Snackbar
//           open={snackbarOpen}
//           autoHideDuration={6000}
//           onClose={handleCloseSnackbar}
//         >
//           <Alert
//             onClose={handleCloseSnackbar}
//             severity={snackbarSeverity}
//             sx={{ width: "100%" }}
//           >
//             {snackbarMessage}
//           </Alert>
//         </Snackbar>
//       </Container>
//     </PayPalScriptProvider>
//   );
// };

// export default RepairHistory;

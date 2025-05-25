import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
    CircularProgress,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import { AuthContext } from "./AuthContext";
import api from "../api";

const MechanicCarDetails = () => {
    const { carId } = useParams();
    const location = useLocation();
    const { appointmentId } = location.state || {};
    const { user } = useContext(AuthContext);
    const [carDetails, setCarDetails] = useState({});
    const [repairs, setRepairs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const [openAddRepairDialog, setOpenAddRepairDialog] = useState(false);
    const [newRepair, setNewRepair] = useState({
        appointmentId: appointmentId || "",
        description: "",
        cost: "",
        usedParts: [{ partName: "", partNumber: "", partCost: "", mileageAtRepair: "" }],
    });
    const [usedParts, setUsedParts] = useState([]);
    const [openPartsDialog, setOpenPartsDialog] = useState(false);
    const [selectedRepairId, setSelectedRepairId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCarDetails = async () => {
            try {
                if (!user || !user.accessToken) {
                    throw new Error("Użytkownik nie jest zalogowany!");
                }

                const response = await api.getCarDetailsForMechanic(carId);
                setCarDetails(response.data.car || {});
                setRepairs(response.data.repairs || []);
            } catch (error) {
                console.error("Błąd podczas pobierania szczegółów samochodu:", error);
                setSnackbarMessage("Błąd podczas pobierania szczegółów samochodu");
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
            } finally {
                setLoading(false);
            }
        };

        fetchCarDetails();
    }, [carId, user]);

    useEffect(() => {
        if (appointmentId) {
            setNewRepair((prev) => ({
                ...prev,
                appointmentId: appointmentId,
            }));
        }
    }, [appointmentId]);

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    const handleOpenAddRepairDialog = () => {
        setOpenAddRepairDialog(true);
    };

    const handleCloseAddRepairDialog = () => {
        setOpenAddRepairDialog(false);
        setNewRepair({
            appointmentId: appointmentId || "",
            description: "",
            cost: "",
            usedParts: [{ partName: "", partNumber: "", partCost: "", mileageAtRepair: "" }],
        });
    };

    const handleAddRepairChange = (e) => {
        const { name, value } = e.target;
        setNewRepair((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePartChange = (index, e) => {
        const { name, value } = e.target;
        const newParts = [...newRepair.usedParts];
        newParts[index][name] = value;
        setNewRepair((prev) => ({
            ...prev,
            usedParts: newParts,
        }));
    };

    const addPartField = () => {
        setNewRepair((prev) => ({
            ...prev,
            usedParts: [...prev.usedParts, { partName: "", partNumber: "", partCost: "", mileageAtRepair: "" }],
        }));
    };

    const fetchUsedParts = async (repairId) => {
        try {
            if (!user || !user.accessToken) {
                throw new Error("Użytkownik nie jest zalogowany!");
            }

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

    const handleAddRepairSubmit = async () => {
        if (!user || !user.accessToken) {
            setSnackbarMessage("Użytkownik nie jest zalogowany!");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        if (!newRepair.appointmentId || !newRepair.description || !newRepair.cost) {
            setSnackbarMessage("Wszystkie pola są wymagane!");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        if (isNaN(parseFloat(newRepair.cost)) || parseFloat(newRepair.cost) <= 0) {
            setSnackbarMessage("Koszt musi być liczbą większą od zera!");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        try {
            const repairData = {
                appointmentId: Number(newRepair.appointmentId),
                carId: Number(carId),
                description: newRepair.description,
                cost: parseFloat(newRepair.cost),
                usedParts: newRepair.usedParts.map((part) => ({
                    partName: part.partName,
                    partNumber: part.partNumber,
                    partCost: parseFloat(part.partCost),
                    mileageAtRepair: parseInt(part.mileageAtRepair),
                })),
            };

            const response = await api.addRepair(
                repairData.appointmentId,
                repairData.carId,
                repairData.description,
                repairData.cost,
                repairData.usedParts
            );

            setRepairs((prevRepairs) => [...prevRepairs, response.data]);

            setSnackbarMessage("Naprawa została dodana pomyślnie!");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
            handleCloseAddRepairDialog();
        } catch (error) {
            console.error("Błąd podczas dodawania naprawy:", error);
            setSnackbarMessage("Błąd podczas dodawania naprawy");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentId = urlParams.get('paymentId');
        const payerId = urlParams.get('PayerID');

        if (paymentId && payerId) {
            const executePayment = async () => {
                try {
                    const response = await api.executePayment(paymentId, payerId);
                    if (response.data === "approved") {
                        await api.updatePaymentStatus(selectedRepairId, "Paid");
                        setSnackbarMessage("Płatność zakończona sukcesem!");
                        setSnackbarSeverity("success");
                        setRepairs((prevRepairs) =>
                            prevRepairs.map((repair) =>
                                repair.id === selectedRepairId ? { ...repair, paymentStatus: "Paid" } : repair
                            )
                        );
                    } else {
                        setSnackbarMessage("Płatność nie powiodła się!");
                        setSnackbarSeverity("error");
                    }
                    setSnackbarOpen(true);
                } catch (error) {
                    console.error("Error executing payment:", error);
                }
            };

            executePayment();
        }
    }, [selectedRepairId]);

    if (loading) {
        return (
            <Container>
                <Box sx={{ mt: 8, textAlign: "center" }}>
                    <CircularProgress />
                    <Typography variant="body1" sx={{ mt: 4 }}>
                        Ładowanie danych samochodu...
                    </Typography>
                </Box>
            </Container>
        );
    }

    if (!carDetails || Object.keys(carDetails).length === 0) {
        return (
            <Container>
                <Box sx={{ mt: 8, textAlign: "center" }}>
                    <Typography variant="body1" sx={{ mt: 4 }}>
                        Nie udało się załadować danych samochodu.
                    </Typography>
                </Box>
            </Container>
        );
    }

    return (
        <Container>
            <Box sx={{ mt: 8, textAlign: "center" }}>
                <Typography variant="h4" component="h1">
                    Szczegóły samochodu
                </Typography>

                <Typography variant="body1" sx={{ mt: 4 }}>
                    Marka: {carDetails.brand || "Brak danych"}
                </Typography>
                <Typography variant="body1">Model: {carDetails.model || "Brak danych"}</Typography>
                <Typography variant="body1">Rok produkcji: {carDetails.year || "Brak danych"}</Typography>
                <Typography variant="body1">Numer VIN: {carDetails.vin || "Brak danych"}</Typography>
                <Typography variant="body1">
                    Numer rejestracyjny: {carDetails.licensePlate || "Brak danych"}
                </Typography>
                <Typography variant="body1">Opis: {carDetails.description || "Brak danych"}</Typography>

                <Typography variant="h5" sx={{ mt: 4 }}>
                    Historia napraw
                </Typography>
                {repairs.length > 0 ? (
                    <List>
                        {repairs.map((repair) => (
                            <ListItem key={repair.id}>
                                <ListItemText
                                    primary={`Opis: ${repair.description}`}
                                    secondary={`Koszt: ${repair.cost} PLN, Data: ${new Date(
                                        repair.completionDate
                                    ).toLocaleDateString()}, Status płatności: ${repair.paymentStatus || "Not Paid"}`}
                                />
                                <Button
                                    variant="contained"
                                    onClick={() => {
                                        setSelectedRepairId(repair.id);
                                        fetchUsedParts(repair.id);
                                    }}
                                >
                                    Przeglądaj części
                                </Button>
                                {/* {repair.paymentStatus !== "Paid" && (
                                    // <Button
                                    //     variant="contained"
                                    //     onClick={() => handlePayNow(repair.id)}
                                    //     sx={{ ml: 2 }}
                                    // >
                                    //     Zapłać
                                    // </Button>
                                )} */}
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Typography variant="body1" sx={{ mt: 4 }}>
                        Brak historii napraw.
                    </Typography>
                )}

                <Button
                    variant="contained"
                    onClick={handleOpenAddRepairDialog}
                    sx={{ mt: 4, mr: 2 }}
                >
                    Dodaj naprawę
                </Button>
                <Button
                    variant="contained"
                    onClick={() => navigate("/mechanic/appointments")}
                    sx={{ mt: 4 }}
                >
                    Powrót do wizyt
                </Button>
            </Box>

            {/* Dialog do dodawania naprawy */}
            <Dialog open={openAddRepairDialog} onClose={handleCloseAddRepairDialog}>
                <DialogTitle>Dodaj nową naprawę</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="ID Wizyty"
                        name="appointmentId"
                        value={newRepair.appointmentId}
                        onChange={handleAddRepairChange}
                        disabled
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Opis naprawy"
                        name="description"
                        value={newRepair.description}
                        onChange={handleAddRepairChange}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Koszt (PLN)"
                        name="cost"
                        type="number"
                        value={newRepair.cost}
                        onChange={handleAddRepairChange}
                    />

                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Użyte części
                    </Typography>
                    {newRepair.usedParts.map((part, index) => (
                        <Box key={index} sx={{ display: "flex", gap: 2, mt: 2 }}>
                            <TextField
                                fullWidth
                                label="Nazwa części"
                                name="partName"
                                value={part.partName}
                                onChange={(e) => handlePartChange(index, e)}
                            />
                            <TextField
                                fullWidth
                                label="Numer części"
                                name="partNumber"
                                value={part.partNumber}
                                onChange={(e) => handlePartChange(index, e)}
                            />
                            <TextField
                                fullWidth
                                label="Koszt części (PLN)"
                                name="partCost"
                                type="number"
                                value={part.partCost}
                                onChange={(e) => handlePartChange(index, e)}
                            />
                            <TextField
                                fullWidth
                                label="Przebieg (km)"
                                name="mileageAtRepair"
                                type="number"
                                value={part.mileageAtRepair}
                                onChange={(e) => handlePartChange(index, e)}
                            />
                        </Box>
                    ))}
                    <Button onClick={addPartField} sx={{ mt: 2 }}>
                        Dodaj część
                    </Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddRepairDialog}>Anuluj</Button>
                    <Button onClick={handleAddRepairSubmit} color="primary">
                        Dodaj
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog do przeglądania części */}
            <Dialog open={openPartsDialog} onClose={() => setOpenPartsDialog(false)}>
                <DialogTitle>Części używane w naprawie</DialogTitle>
                <DialogContent>
                    {usedParts.length > 0 ? (
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
                    ) : (
                        <Typography variant="body1">Brak części dla tej naprawy.</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPartsDialog(false)}>Zamknij</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default MechanicCarDetails;
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../../redux/userRelated/userHandle';
import Popup from '../../../components/Popup';
import { underControl } from '../../../redux/userRelated/userSlice';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { Container, Typography, TextField, Button, CircularProgress, FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';

// Utility function to validate strong passwords
const isStrongPassword = (password) => {
    // Regex: At least 1 lowercase, 1 uppercase, 1 digit, 1 special character, min length 8
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return strongPasswordRegex.test(password);
};

const AddStudent = ({ situation }) => {
    // Redux hooks to dispatch actions and get current URL parameters
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();

    // Extracting data from Redux store (user info and class list)
    const userState = useSelector(state => state.user);
    const { status, currentUser, response, error } = userState;
    const { sclassesList } = useSelector((state) => state.sclass);

    // Form field state variables for student registration
    const [name, setName] = useState('');
    const [rollNum, setRollNum] = useState('');
    const [password, setPassword] = useState('');
    const [sclassName, setSclassName] = useState('');
    const [profilePic, setProfilePic] = useState(null); // File input for profile picture

    // Fixed metadata for the new user being registered
    const adminID = currentUser._id;  // Creator/Admin ID
    const role = "Student";           // Role assigned to the new user

    // UI feedback states
    const [showPopup, setShowPopup] = useState(false); // Controls visibility of popup messages
    const [message, setMessage] = useState("");        // Message to show in popup
    const [loader, setLoader] = useState(false);       // Controls loading state (e.g., spinner)

    // If accessed from a class context, prefill the class ID from URL params
    useEffect(() => {
        if (situation === "Class") {
            setSclassName(params.id);
        }
    }, [params.id, situation]);

    // Fetch the list of available classes to populate the dropdown
    useEffect(() => {
        dispatch(getAllSclasses(adminID, "Sclass"));
    }, [adminID, dispatch]);

    // Handle change event on class selection dropdown
    const changeHandler = (event) => {
        const selectedValue = event.target.value;

        // Find and set the selected class by matching ID
        const selectedClass = sclassesList.find(
            (classItem) => classItem._id === selectedValue
        );

        if (selectedClass) {
            setSclassName(selectedClass._id);
        } else {
            setSclassName('');
        }
    };

    // Handle the form submission
    const submitHandler = (event) => {
        event.preventDefault();

        // Input validation
        if (sclassName === "") {
            setMessage("Please select a class");
            setShowPopup(true);
            return;
        }
        if (!isStrongPassword(password)) {
            setMessage("Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.");
            setShowPopup(true);
            return;
        }

        setLoader(true); // Show loader while dispatching request

        // Construct FormData object to send to backend (supports file upload)
        const formData = new FormData();
        formData.append('name', name);
        formData.append('rollNum', rollNum);
        formData.append('password', password);
        formData.append('sclassName', sclassName);
        formData.append('adminID', adminID);
        formData.append('role', role);

        // Append profile picture only if user has selected one
        if (profilePic) {
            formData.append('profilePic', profilePic);
        }

        // Dispatch register action with form data and role type
        dispatch(registerUser(formData, role));
    };

    // Effect to handle response after attempting registration
    useEffect(() => {
        if (status === 'added') {
            dispatch(underControl()); // Clear status to avoid repeat triggers
            navigate(-1);             // Navigate back to previous page after successful registration
        } else if (status === 'failed') {
            setMessage(response);     // Show server response if registration fails
            setShowPopup(true);
            setLoader(false);
        } else if (status === 'error') {
            setMessage("Network Error"); // Handle connection errors gracefully
            setShowPopup(true);
            setLoader(false);
        }
    }, [status, navigate, error, response, dispatch]);

    return (
        <Container component="main" maxWidth="xs">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">
                    Add Student
                </Typography>
                <Box component="form" onSubmit={submitHandler} sx={{ mt: 3 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="name"
                        label="Name"
                        name="name"
                        autoComplete="name"
                        autoFocus
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="rollNum"
                        label="Roll Number"
                        name="rollNum"
                        type="number"
                        autoComplete="roll-number"
                        value={rollNum}
                        onChange={(e) => setRollNum(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="password"
                        label="Password"
                        type="password"
                        name="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {/* Upload profile picture (Optional for form submission) */}
                    <TextField
                        margin="normal"
                        fullWidth
                        type="file"
                        name="profilePic"
                        inputProps={{ accept: "image/*" }}
                        onChange={(e) => setProfilePic(e.target.files[0])}
                    />
                    <FormControl fullWidth margin="normal" required>
                        <InputLabel id="class-select-label">Class</InputLabel>
                        <Select
                            labelId="class-select-label"
                            id="class-select"
                            value={sclassName}
                            label="Class"
                            onChange={changeHandler}
                        >
                            {sclassesList.map((cls) => (
                                <MenuItem key={cls._id} value={cls._id}>
                                    {cls.sclassName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loader}
                    >
                        {loader ? <CircularProgress size={24} color="inherit" /> : 'Add'}
                    </Button>
                </Box>
            </Box>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
};

export default AddStudent;
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../../redux/userRelated/userHandle';
import Popup from '../../../components/Popup';
import { underControl } from '../../../redux/userRelated/userSlice';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { Container, Typography, TextField, Button, CircularProgress, FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';

const isStrongPassword = (password) => {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return strongPasswordRegex.test(password);
};

const AddStudent = ({ situation }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();

    // Extract necessary user and sclass data from the Redux store
    const userState = useSelector(state => state.user);
    const { status, currentUser, response, error } = userState;
    const { sclassesList } = useSelector((state) => state.sclass);

    // Form field states
    const [name, setName] = useState('');
    const [rollNum, setRollNum] = useState('');
    const [password, setPassword] = useState('');
    const [sclassName, setSclassName] = useState('');
    const [profilePic, setProfilePic] = useState(null); // Store the selected profile picture file

    // Fixed values for admin ID and user role
    const adminID = currentUser._id;
    const role = "Student";

    // UI state for loading and popup messages
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false);

    // If accessed from the "Class" route, auto-fill the class ID from params
    useEffect(() => {
        if (situation === "Class") {
            setSclassName(params.id);
        }
    }, [params.id, situation]);

    // Fetch the list of classes for dropdown selection
    useEffect(() => {
        dispatch(getAllSclasses(adminID, "Sclass"));
    }, [adminID, dispatch]);

    // Update selected class when user selects from dropdown
    const changeHandler = (event) => {
        const selectedValue = event.target.value;
        const selectedClass = sclassesList.find(
            (classItem) => classItem._id === selectedValue
        );
        if (selectedClass) {
            setSclassName(selectedClass._id);
        } else {
            setSclassName('');
        }
    };

    // Handles the form submission logic
    const submitHandler = (event) => {
        event.preventDefault();

        // Validate required fields
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

        setLoader(true);

        // Build form data for student registration
        const formData = new FormData();
        formData.append('name', name);
        formData.append('rollNum', rollNum);
        formData.append('password', password);
        formData.append('sclassName', sclassName);
        formData.append('adminID', adminID);
        formData.append('role', role);
        
        // Include profile picture only if user has selected a file
        if (profilePic) {
            formData.append('profilePic', profilePic);
        }

        // Dispatch the registration action with form data and role
        dispatch(registerUser(formData, role));
    };

    // React to changes in registration status
    useEffect(() => {
        if (status === 'added') {
            dispatch(underControl()); // Reset status after successful registration
            navigate(-1); // Navigate back to the previous page
        } else if (status === 'failed') {
            setMessage(response); // Show specific error message from the backend
            setShowPopup(true);
            setLoader(false);
        } else if (status === 'error') {
            setMessage("Network Error"); // Show a generic error message
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
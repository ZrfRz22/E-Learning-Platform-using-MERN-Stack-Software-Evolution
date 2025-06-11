import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getSubjectDetails } from '../../../redux/sclassRelated/sclassHandle';
import { registerUser } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import { Box, Button, CircularProgress, Container, TextField, Typography } from '@mui/material';
import Popup from '../../../components/Popup';

const isStrongPassword = (password) => {
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return strongPasswordRegex.test(password);
};

const AddTeacher = () => {
    const params = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Get subject ID from the URL
    const subjectID = params.id;

    // Extract user and subject details state from Redux
    const { status, response, error } = useSelector((state) => state.user);
    const { subjectDetails, loading: sclassLoading } = useSelector((state) => state.sclass);

    // Fetch subject details when component mounts
    useEffect(() => {
        dispatch(getSubjectDetails(subjectID, "Subject"));
    }, [dispatch, subjectID]);

    // Form input states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // 1. File input state for teacher's profile picture
    const [profilePic, setProfilePic] = useState(null);

    const [loader, setLoader] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const role = "Teacher";

    // 2. Submit handler to process teacher registration
    const submitHandler = (e) => {
        e.preventDefault();

        const college = subjectDetails?.college;
        const teachSubject = subjectDetails?._id;
        const teachSclass = subjectDetails?.sclassName?._id;

        // Basic validation for required fields
        if (!name || !email || !password) {
            setMessage("Please fill all required fields.");
            setShowPopup(true);
            return;
        }

        // Validate password strength
        if (!isStrongPassword(password)) {
            setMessage("Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.");
            setShowPopup(true);
            return;
        }

        setLoader(true);

        // Create form data object for submission
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('role', role);
        formData.append('college', college);
        formData.append('teachSubject', teachSubject);
        formData.append('teachSclass', teachSclass);

        // 3. If a profile picture was selected, include it in the form data
        if (profilePic) {
            formData.append('profilePic', profilePic);
        }

        // Dispatch registration action with form data
        dispatch(registerUser(formData, role));
    };

    // 4. Handle post-submission status updates
    useEffect(() => {
        if (status === 'added') {
            dispatch(underControl());
            navigate("/Admin/teachers");
        } else if (status === 'failed') {
            setMessage(response);
            setShowPopup(true);
            setLoader(false);
        } else if (status === 'error') {
            setMessage("Network Error");
            setShowPopup(true);
            setLoader(false);
        }
    }, [status, navigate, dispatch, response]);

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5">
                    Add Teacher
                </Typography>
                <Box component="form" noValidate onSubmit={submitHandler} sx={{ mt: 3 }}>
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
                        id="email"
                        label="Email"
                        name="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        Subject: {subjectDetails?.subName}
                    </Typography>
                    <Typography variant="body1">
                        Class: {subjectDetails?.sclassName?.sclassName}
                    </Typography>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loader}
                    >
                        {loader ? <CircularProgress size={24} color="inherit" /> : 'Register'}
                    </Button>
                </Box>
            </Box>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
};

export default AddTeacher;

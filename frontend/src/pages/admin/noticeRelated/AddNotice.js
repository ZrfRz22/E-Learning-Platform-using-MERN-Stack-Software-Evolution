// React & Redux hooks and router
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// Redux actions
import { addStuff } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';

// MUI (Material UI) components
import {
  CircularProgress,
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Stack,
  Divider
} from '@mui/material';

// Custom styled button and popup component
import { BlueButton } from '../../../components/buttonStyles';
import Popup from '../../../components/Popup';

// Styled-components
import styled from 'styled-components';

// Main component: AddNotice
const AddNotice = () => {
  const dispatch = useDispatch(); // Allows dispatching Redux actions
  const navigate = useNavigate(); // Hook for programmatic navigation

  // Extracting data from Redux state
  const { status, response, error } = useSelector(state => state.user);
  const { currentUser } = useSelector(state => state.user);

  // Local state for form inputs
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [date, setDate] = useState('');
  const adminID = currentUser._id; // Admin ID from the logged-in user

  // State for UI feedback
  const [loader, setLoader] = useState(false); // Show loading spinner during request
  const [showPopup, setShowPopup] = useState(false); // Control popup visibility
  const [message, setMessage] = useState(""); // Popup message

  // Prepare data to send to backend
  const fields = { title, details, date, adminID };
  const address = "Notice";

  // Handle form submission
  const submitHandler = (event) => {
    event.preventDefault();
    setLoader(true); // Show loader
    dispatch(addStuff(fields, address)); // Dispatch Redux action to add notice
  };

  // Watch for Redux state changes after submission
  useEffect(() => {
    if (status === 'added') {
      navigate('/Admin/notices'); // Navigate to notices list after success
      dispatch(underControl()); // Reset status
    } else if (status === 'error') {
      setMessage("Network Error"); // Show error popup on failure
      setShowPopup(true);
      setLoader(false);
    }
  }, [status, navigate, error, response, dispatch]);

  // Render the form UI
  return (
    <>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <StyledPaper elevation={4}>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
            Add New Notice
          </Typography>
          <Divider sx={{ mb: 4 }} />
          <form onSubmit={submitHandler}>
            <Stack spacing={3}>
              {/* Title input */}
              <TextField
                label="Title"
                variant="outlined"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                fullWidth
              />
              {/* Details textarea */}
              <TextField
                label="Details"
                variant="outlined"
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                required
                fullWidth
                multiline
                rows={4}
              />
              {/* Date input */}
              <TextField
                label="Date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                required
                fullWidth
              />
              {/* Submit button with loading indicator */}
              <BlueButton
                fullWidth
                size="large"
                variant="contained"
                type="submit"
                disabled={loader}
              >
                {loader ? <CircularProgress size={24} color="inherit" /> : 'Add Notice'}
              </BlueButton>
            </Stack>
          </form>
        </StyledPaper>
      </Container>

      {/* Popup for error messages */}
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </>
  );
};

export default AddNotice;

// Styled Paper component using styled-components
const StyledPaper = styled(Paper)`
  padding: 40px;
  border-radius: 20px;
`;
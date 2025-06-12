import React, { useEffect, useState } from 'react';
// Redux hooks for dispatching actions and accessing state
import { useDispatch, useSelector } from 'react-redux';
// React Router hooks for routing
import { useNavigate, useParams, useLocation } from 'react-router-dom';
// Redux actions
import { getUserDetails } from '../../../redux/userRelated/userHandle';
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import { updateStudentFields } from '../../../redux/studentRelated/studentHandle';
// Components
import Popup from '../../../components/Popup';
import { BlueButton } from '../../../components/buttonStyles';
// MUI Components
import {
    Box, InputLabel, MenuItem, Select, Typography,
    Stack, TextField, CircularProgress, FormControl
} from '@mui/material';

const StudentExamMarks = ({ situation }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();
    const location = useLocation();

    // Redux state
    const { currentUser, userDetails, loading } = useSelector((state) => state.user);
    const { subjectsList } = useSelector((state) => state.sclass);
    const { response, error, statestatus } = useSelector((state) => state.student);

    // Extract student ID and optionally preselected subject ID from URL or state
    const studentID = params.id || params.studentID;
    const preselectedSubjectId = location.state?.subjectId;

    // Component state
    const [subjectId, setSubjectId] = useState(preselectedSubjectId || params.subjectID || "");
    const [marksObtained, setMarksObtained] = useState(location.state?.currentMarks || "");

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false);

    // Fetch student details when the component mounts or studentID changes
    useEffect(() => {
        if (studentID) {
            dispatch(getUserDetails(studentID, "Student"));
        }
    }, [dispatch, studentID]);

    // Fetch subject list once userDetails are available
    useEffect(() => {
        if (userDetails && userDetails.sclassName) {
            dispatch(getSubjectList(userDetails.sclassName._id, "ClassSubjects"));
        }
    }, [dispatch, userDetails]);

    // Handle form submission result from Redux
    useEffect(() => {
        if (response) {
            setLoader(false);
            setShowPopup(true);
            setMessage(response);
        } else if (error) {
            setLoader(false);
            setShowPopup(true);
            setMessage("Error occurred");
        } else if (statestatus === "added") {
            setLoader(false);
            setShowPopup(true);
            setMessage("Done Successfully");
        }
    }, [response, statestatus, error]);
    
    // Handle subject selection change
    const handleSubjectChange = (event) => {
        setSubjectId(event.target.value);
    };

    // Submit handler for the form
    const submitHandler = (event) => {
        event.preventDefault();
        setLoader(true);
        const fields = { subName: subjectId, marksObtained };
        dispatch(updateStudentFields(studentID, fields, "UpdateExamResult"));
    };

    // Find the subject name to display (used in "Subject" mode)
    const subjectNameToDisplay = subjectsList.find(sub => sub._id === subjectId)?.subName;

    return (
        <>
            {loading ? (
                // Show loading state while fetching user details
                <div>Loading...</div>
            ) : (
                <>
                    <Box sx={{ flex: '1 1 auto', alignItems: 'center', display: 'flex', justifyContent: 'center' }}>
                        <Box sx={{ maxWidth: 550, px: 3, py: '100px', width: '100%' }}>
                            <Stack spacing={1} sx={{ mb: 3 }}>
                                <Typography variant="h4">
                                    Student Name: {userDetails?.name}
                                </Typography>
                                {situation === "Subject" && (
                                    <Typography variant="h5">
                                        Subject: {subjectNameToDisplay}
                                    </Typography>
                                )}
                            </Stack>
                            <form onSubmit={submitHandler}>
                                <Stack spacing={3}>
                                    {/* Show subject selection if we are in "Student" mode */}
                                    {situation === "Student" && (
                                        <FormControl fullWidth required>
                                            <InputLabel id="subject-select-label">Select Subject</InputLabel>
                                            <Select
                                                labelId="subject-select-label"
                                                id="subject-select"
                                                value={subjectId}
                                                label="Select Subject"
                                                onChange={handleSubjectChange}
                                            >
                                                {subjectsList ? (
                                                    subjectsList.map((subject) => (
                                                        <MenuItem key={subject._id} value={subject._id}>
                                                            {subject.subName}
                                                        </MenuItem>
                                                    ))
                                                ) : (
                                                    <MenuItem value="">No Subjects Available</MenuItem>
                                                )}
                                            </Select>
                                        </FormControl>
                                    )}
                                    {/* Input for marks */}
                                    <FormControl fullWidth>
                                        <TextField
                                            label="Enter marks"
                                            type="number"
                                            value={marksObtained}
                                            onChange={(e) => setMarksObtained(e.target.value)}
                                            required
                                        />
                                    </FormControl>
                                </Stack>
                                {/* Submit button with loader */}
                                <BlueButton
                                    fullWidth
                                    size="large"
                                    sx={{ mt: 3 }}
                                    variant="contained"
                                    type="submit"
                                    disabled={loader}
                                >
                                    {loader ? <CircularProgress size={24} color="inherit" /> : "Submit"}
                                </BlueButton>
                            </form>
                        </Box>
                    </Box>
                    {/* Feedback popup */}
                    <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
                </>
            )}
        </>
    );
};

export default StudentExamMarks;

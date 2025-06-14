import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Action creators for fetching user and subject data
import { getUserDetails } from '../../redux/userRelated/userHandle';
import { getSubjectList } from '../../redux/sclassRelated/sclassHandle';

// UI components from MUI
import {
    Container, Paper, Typography, Box, Table, TableBody,
    TableHead, List, ListItem, ListItemText, ListItemIcon, Divider,
    ToggleButtonGroup, ToggleButton
} from '@mui/material';

// Custom bar chart component and styled table components
import CustomBarChart from '../../components/CustomBarChart';
import { StyledTableCell, StyledTableRow } from '../../components/styles';

// MUI Icons
import { Book, TableChart, InsertChart } from '@mui/icons-material';

// Styled-components for customizing Paper
import styled from 'styled-components';

// Main functional component for displaying student subjects and marks
const StudentSubjects = () => {
    const dispatch = useDispatch();

    // Extract data from Redux store
    const { subjectsList } = useSelector((state) => state.sclass);
    const { userDetails, currentUser, loading, error } = useSelector((state) => state.user);

    // Local state for subject marks and current section view (table or chart)
    const [subjectMarks, setSubjectMarks] = useState([]);
    const [selectedSection, setSelectedSection] = useState('table');

    // Fetch student user details on component mount
    useEffect(() => {
        dispatch(getUserDetails(currentUser._id, "Student"));
    }, [dispatch, currentUser._id]);

    // Once user details are available, fetch subjects and set marks
    useEffect(() => {
        if (userDetails && userDetails.sclassName?._id) {
            dispatch(getSubjectList(userDetails.sclassName._id, "ClassSubjects"));
            setSubjectMarks(userDetails.examResult || []);
        }
    }, [dispatch, userDetails]);

    // Log any potential error from the Redux store
    if (error) {
        console.log(error);
    }

    // Handler to toggle between table view and chart view
    const handleSectionChange = (event, newSection) => {
        if (newSection !== null) {
            setSelectedSection(newSection);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Show loading spinner/text while data is loading */}
            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    {/* Display list of subjects */}
                    <StyledPaper elevation={4}>
                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                            Your Subjects
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            These are all the subjects you are enrolled in for class {currentUser.sclassName?.sclassName}.
                        </Typography>
                        <Divider sx={{ mb: 2 }}/>
                        <List>
                            {(subjectsList || []).map((subject, index) => (
                                <ListItem key={index}>
                                    <ListItemIcon>
                                        <Book />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={subject.subName}
                                        secondary={`Code: ${subject.subCode}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </StyledPaper>

                    {/* Conditionally render the marks section only if marks exist */}
                    {subjectMarks && subjectMarks.length > 0 && (
                        <StyledPaper elevation={4} sx={{ mt: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                                    Your Marks
                                </Typography>

                                {/* Toggle buttons to switch between table and chart views */}
                                <ToggleButtonGroup
                                    value={selectedSection}
                                    exclusive
                                    onChange={handleSectionChange}
                                    aria-label="view-toggle"
                                >
                                    <ToggleButton value="table" aria-label="table view"><TableChart /></ToggleButton>
                                    <ToggleButton value="chart" aria-label="chart view"><InsertChart /></ToggleButton>
                                </ToggleButtonGroup>
                            </Box>
                            <Divider sx={{ mb: 4 }} />

                            {/* Render marks in table format if 'table' is selected */}
                            {selectedSection === 'table' ? (
                                <Table>
                                    <TableHead>
                                        <StyledTableRow>
                                            <StyledTableCell>Subject</StyledTableCell>
                                            <StyledTableCell>Marks</StyledTableCell>
                                        </StyledTableRow>
                                    </TableHead>
                                    <TableBody>
                                        {subjectMarks.map((result, index) => {
                                            // Skip entries with missing data
                                            if (!result.subName || result.marksObtained === undefined) {
                                                return null;
                                            }
                                            return (
                                                <StyledTableRow key={index}>
                                                    <StyledTableCell>{result.subName.subName}</StyledTableCell>
                                                    <StyledTableCell>{result.marksObtained}</StyledTableCell>
                                                </StyledTableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            ) : (
                                // Render chart if 'chart' is selected
                                <Box sx={{ height: '500px' }}>
                                    <CustomBarChart chartData={subjectMarks} dataKey="marksObtained" />
                                </Box>
                            )}
                        </StyledPaper>
                    )}
                </>
            )}
        </Container>
    );
};

export default StudentSubjects;

// Custom styled Paper component with padding and rounded corners
const StyledPaper = styled(Paper)`
    padding: 32px;
    border-radius: 16px;
`;
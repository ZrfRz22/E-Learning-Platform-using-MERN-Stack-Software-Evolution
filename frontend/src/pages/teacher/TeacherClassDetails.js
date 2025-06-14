import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getClassStudents } from "../../redux/sclassRelated/sclassHandle";
import { Avatar, Paper, Box, Typography, Button, Container, Grid } from '@mui/material';
import { BlueButton, PurpleButton } from "../../components/buttonStyles";
import TableTemplate from "../../components/TableTemplate";
import styled from "styled-components";

const TeacherClassDetails = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Extracting necessary data from the Redux store
    const { sclassStudents, loading, error, getresponse } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector((state) => state.user);

    // Getting class ID and subject ID from the current user's assigned class and subject
    const classID = currentUser.teachSclass?._id;
    const subjectID = currentUser.teachSubject?._id;

    // Fetch students when the component mounts or when classID changes
    useEffect(() => {
        if (classID) {
            dispatch(getClassStudents(classID));
        }
    }, [dispatch, classID]);

    // Log error if there's any issue with fetching students
    if (error) {
        console.log(error);
    }

    // Define the column structure for the student table
    const studentColumns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'rollNum', label: 'Roll Number', minWidth: 100 },
    ];

    // Format each student row for the table, including avatar images
    const studentRows = (sclassStudents || []).map((student) => {
        const imageUrl = `${process.env.REACT_APP_BASE_URL}/uploads/student/${student.profilePic}`;
        return {
            name: (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar src={imageUrl} alt={student.name} sx={{ mr: 2 }} />
                    {student.name}
                </Box>
            ),
            rollNum: student.rollNum,
            id: student._id, // Needed for dynamic routing and actions
        };
    });

    // Buttons for each student: View details, View attendance, View marks
    const StudentsButtonHaver = ({ row }) => {
        return (
            <ButtonContainer>
                <BlueButton
                    variant="contained"
                    onClick={() => navigate("/Teacher/class/student/" + row.id)}
                >
                    View
                </BlueButton>
                <PurpleButton
                    variant="contained"
                    onClick={() => navigate(`/Teacher/class/student/attendance/${row.id}/${subjectID}`)}
                >
                    Attendance
                </PurpleButton>
                <BlueButton
                    variant="contained"
                    color="secondary"
                    onClick={() => navigate(`/Teacher/class/student/marks/${row.id}/${subjectID}`)}
                >
                    Marks
                </BlueButton>
            </ButtonContainer>
        );
    };

    return (
        <>
            {/* Show loading indicator if students are still being fetched */}
            {loading ? (
                <div>Loading...</div>
            ) : (
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                    {/* Class Details Header */}
                    <StyledPaper elevation={3}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs>
                                <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                                    {currentUser.teachSubject?.subName}
                                </Typography>
                                <Typography variant="subtitle1" color="textSecondary">
                                    {currentUser.teachSclass?.sclassName}
                                </Typography>
                            </Grid>
                            <Grid item>
                                {/* Display total number of students */}
                                <StatBox>
                                    <Typography variant="h4">{(sclassStudents || []).length}</Typography>
                                    <Typography color="textSecondary">Total Students</Typography>
                                </StatBox>
                            </Grid>
                        </Grid>
                    </StyledPaper>

                    {/* Student List Table Section */}
                    <Paper sx={{ width: '100%', overflow: 'hidden', p: 3, borderRadius: '12px' }} elevation={3}>
                        {getresponse ? (
                            // Display message if no students found
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
                                <Typography variant="h6">No Students Found</Typography>
                            </Box>
                        ) : (
                            <>
                                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                                    Students List
                                </Typography>
                                {/* Show table only if there are students */}
                                {Array.isArray(sclassStudents) && sclassStudents.length > 0 &&
                                    <TableTemplate buttonHaver={StudentsButtonHaver} columns={studentColumns} rows={studentRows} />
                                }
                            </>
                        )}
                    </Paper>
                </Container>
            )}
        </>
    );
};

export default TeacherClassDetails;

// --- Styled Components ---

// Style for the top card displaying subject and class info
const StyledPaper = styled(Paper)`
    padding: 24px;
    border-radius: 16px;
    margin-bottom: 32px;
`;

// Box style for the total student count
const StatBox = styled(Box)`
    padding: 16px;
    text-align: center;
`;

// Layout for the action buttons beside each student row
const ButtonContainer = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    width: 100%;
`;
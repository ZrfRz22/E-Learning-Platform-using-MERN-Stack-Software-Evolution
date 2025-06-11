import React, { useEffect } from 'react';
import { getTeacherDetails } from '../../../redux/teacherRelated/teacherHandle';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, Button, Container, Typography } from '@mui/material';

const TeacherDetails = () => {
    const navigate = useNavigate();
    const params = useParams();
    const dispatch = useDispatch();
    const { loading, teacherDetails, error } = useSelector((state) => state.teacher);

    const teacherID = params.id;

    useEffect(() => {
        dispatch(getTeacherDetails(teacherID));
    }, [dispatch, teacherID]);

    if (error) {
        console.log(error);
    }

    const isSubjectNamePresent = teacherDetails?.teachSubject?.subName;

    const handleAddSubject = () => {
        navigate(`/Admin/teachers/choosesubject/${teacherDetails?.teachSclass?._id}/${teacherDetails?._id}`);
    };

    // Get the profile picture image URL
    const imageUrl = teacherDetails?.profilePic
        ? `${process.env.REACT_APP_BASE_URL}/uploads/teacher/${teacherDetails.profilePic}`
        : null;

    return (
        <>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <Container>
                    <Typography variant="h4" align="center" gutterBottom>
                        Teacher Details
                    </Typography>
                     {/*Display teacher's profile picture */}
                    <Avatar
                        alt={teacherDetails?.name}
                        src={imageUrl}
                        sx={{ width: 150, height: 150, fontSize: '4rem' }}
                    >
                    </Avatar>
                    <Typography variant="h6" gutterBottom>
                        Teacher Name: {teacherDetails?.name}
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                        Class Name: {teacherDetails?.teachSclass?.sclassName}
                    </Typography>
                    {isSubjectNamePresent ? (
                        <>
                            <Typography variant="h6" gutterBottom>
                                Subject Name: {teacherDetails?.teachSubject?.subName}
                            </Typography>
                            <Typography variant="h6" gutterBottom>
                                Subject Sessions: {teacherDetails?.teachSubject?.sessions}
                            </Typography>
                        </>
                    ) : (
                        <Button variant="contained" onClick={handleAddSubject}>
                            Add Subject
                        </Button>
                    )}
                </Container>
            )}
        </>
    );
};

export default TeacherDetails;
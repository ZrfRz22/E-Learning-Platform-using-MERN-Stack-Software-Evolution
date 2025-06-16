import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    sclassesList: [],
    sclassStudents: [],
    sclassDetails: [],
    subjectsList: [],
    subjectDetails: [],
    teachersList: [],
    loading: false,
    subloading: false,
    error: null,
    response: null,
    getresponse: null,
};

const sclassSlice = createSlice({
    name: 'sclass',
    initialState,
    reducers: {
        getRequest: (state) => {
            state.loading = true;
        },
        getSubDetailsRequest: (state) => {
            state.subloading = true;
        },
        getSuccess: (state, action) => {
            state.sclassesList = action.payload;
            state.loading = false;
            state.error = null;
            state.getresponse = null;
        },
        getStudentsSuccess: (state, action) => {
            state.sclassStudents = action.payload;
            state.loading = false;
            state.error = null;
            state.getresponse = null;
        },
        getSubjectsSuccess: (state, action) => {
            state.subjectsList = action.payload;
            state.loading = false;
            state.error = null;
            state.response = null;
        },
        getFailed: (state, action) => {
            state.subjectsList = [];
            state.response = action.payload;
            state.loading = false;
            state.error = null;
        },
        getFailedTwo: (state, action) => {
            state.sclassesList = [];
            state.sclassStudents = [];
            state.getresponse = action.payload;
            state.loading = false;
            state.error = null;
        },
        getError: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        detailsSuccess: (state, action) => {
            state.sclassDetails = action.payload;
            state.loading = false;
            state.error = null;
        },
        getSubDetailsSuccess: (state, action) => {
            state.subjectDetails = action.payload;
            state.subloading = false;
            state.error = null;
        },
        resetSubjects: (state) => {
            state.subjectsList = [];
            state.sclassesList = [];
        },
        // Reducer to handle successful fetching of teachers
        getTeachersSuccess: (state, action) => {
            // Update the teachersList with the data received from the API (in action.payload)
            state.teachersList = action.payload;

            // Set loading to false since the async request has completed
            state.loading = false;

            // Clear any previous errors
            state.error = null;
        },

        // Reducer to handle successful deletion of subjects
        deleteSubjectsSuccess: (state) => {
            // Clear the subjects list after successful deletion
            state.subjectsList = [];

            // Set loading to false as the operation has finished
            state.loading = false;

            // Clear any existing error messages
            state.error = null;

            // Set a flag indicating that the response was successful (can be used to trigger UI updates)
            state.response = true;
        },

        // Reducer to manually set the response flag
        setResponse: (state, action) => {
            // Update the response state with the value provided in the action payload
            state.response = action.payload;
        },
    },
});

export const {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    getStudentsSuccess,
    getSubjectsSuccess,
    detailsSuccess,
    getFailedTwo,
    resetSubjects,
    getSubDetailsSuccess,
    getSubDetailsRequest,
    getTeachersSuccess,
    deleteSubjectsSuccess,
    setResponse
} = sclassSlice.actions;

export const sclassReducer = sclassSlice.reducer;
export const sclassActions = sclassSlice.actions;
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
        getTeachersSuccess: (state, action) => {
            state.teachersList = action.payload; // Updated to match
            state.loading = false;
            state.error = null;
        },
        deleteSubjectsSuccess: (state) => {
            state.subjectsList = []; // Immediately clear all subjects
            state.loading = false;
            state.error = null;
            state.response = true;
        },
        setResponse: (state, action) => {
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
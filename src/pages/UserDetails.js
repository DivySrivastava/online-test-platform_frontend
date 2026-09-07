import React, { useState, useEffect, useRef } from 'react';
import './css/UserDetails.css';
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const UserDetails = () => {
    const navigate = useNavigate();
    const { userId } = useParams();
    const API_URL = process.env.REACT_APP_API_URL;

    const [userData, setUserData] = useState({});
    const [userInterests, setUserInterests] = useState([]);

    const fetchUserInterests = async () => {

        try {
            const res = await axios.get(
                `${API_URL}/user/interests/${userId}`
            );

            if (res.data.success) {

                setUserInterests(res.data.data);
            } else {
                alert(res.data.message);
            }
        } catch (err) {
            console.error(err);

            alert(
                err.response?.data?.message ||
                "Unable to fetch interests."
            );
        }
    };


    useEffect(() => {
        if (userId) {
            fetchUserDetails();
        }
    }, [userId]);

    useEffect(() => {

        if (userId) {
            fetchUserInterests();
        }
    }, [userData]);

    const fetchUserDetails = async () => {
        try {
            const response = await axios.get(
                `${API_URL}/user/users/${userId}`
            );

            setUserData(response.data);
        } catch (error) {
            console.error("Error fetching user details:", error);
        }
    };

    const formatInterests = (interests) => {
        if (!interests || interests.length === 0) return "";

        const names = interests.map((item) => item.interest_name);

        if (names.length === 1) return names[0];

        if (names.length === 2) return `${names[0]} and ${names[1]}`;

        return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
    };

    const roleMap = {
        1: "Super Admin",
        2: "Admin",
        3: "Teacher",
        4: "Student",
        5: "Normal User"
    };


    const fields = [
        { label: "Name", value: userData.name },
        { label: "UserName", value: userData.username },
        { label: "Role", value: roleMap[userData.role_id] },
        { label: "Email", value: userData.user_email },
        { label: "Mobile", value: userData.user_mobile },
        { label: "Gender", value: userData.user_gender },
        { label: "Join Date", value: userData.created_at },

        ...((userData.role_id === 4 || userData.role_id === 5)
            ? [
                { label: "Father's Name", value: userData.father_name },
                { label: "Standard", value: userData.standard_type }
            ]
            : []),

        ...(userData.role_id === 3
            ? [
                { label: "Designation", value: userData.user_Desig }
            ]
            : []),

        ...(userData.role_id === 3 || userData.role_id === 4
            ? [
                {
                    label: "Interest Area",
                    value: formatInterests(userInterests) || "--"
                }
            ]
            : []),

        ...(userData.role_id === 3 || userData.role_id === 4
            ? [
                { label: "Institute ID", value: userData.institute_id }
            ]
            : [])
    ];
    return (
        <div className="user-detailed-page">
            <div className="dialog-box-userdetailed">
                {/*Header*/}
                <div className="dialog-header-userdetailed">
                    <h2>User ID: {userData.user_id}</h2>
                    <span className="close-btn-dialog-box" onClick={() => navigate(-1)} >X</span>
                </div>
                {/**Form */}
                <div className="dialog-box-form">
                    {fields.map((field, index) => (
                        <div className="form-group-userdetailed" key={index}>
                            <label>{field.label}</label>
                            <input value={field.value || ""} readOnly />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
export default UserDetails;
import React, { useState, useEffect, useRef } from 'react';
import './css/UserDetails.css';
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const UserDetails = () => {
    const navigate = useNavigate();
    const { userId } = useParams();
    const API_URL   = process.env.REACT_APP_API_URL;
    
    const [userData, setUserData] = useState({});

    console.log("ID->", userId);

    useEffect(() => {
        if (userId) {
            fetchUserDetails();
        }
    }, [userId]);

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
        { label: "Role", value:  roleMap[userData.role_id]},
        { label: "Email", value: userData.user_email },
        { label: "Mobile", value: userData.user_mobile },
        { label: "Gender", value: userData.user_gender },
        { label: "Join Date", value: userData.created_at },

        ...(userData.role_id === 4
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

        ...(userData.role_id === 4 || userData.role_id === 5
            ? [
                { label: "Interest Area", value: userData.user_interest }
            ]
            : []),

        ...(userData.role_id === 3 || userData.role_id === 4
            ? [
                { label: "Institute ID", value: userData.institute_id }
            ]
            : [])
    ];
    return(
        <div className="user-detailed-page">
            <div className="dialog-box-userdetailed">
                {/*Header*/}
                <div className="dialog-header-userdetailed">
                    <h2>User ID: {userData.user_id}</h2>
                    <span className="close-btn-dialog-box" onClick={()=> navigate(-1)} >X</span>
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
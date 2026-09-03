import React, { useState, useEffect, useRef } from "react";
import "./css/PendingRequest.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const PendingRequest = () => {
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [showDialog, setShowDialog] = useState(false); // for success popup
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    axios
      .get(`${API_URL}/user/pending-users`)
      .then((res) => setPendingUsers(res.data.data))
      .catch((err) => console.error(err));
  }, []);

  const handleApprove = async (id) => {
    // 1️⃣ Confirmation Alert
    const isConfirmed = window.confirm(
      "Are you sure you want to approve this user?",
    );

    if (!isConfirmed) return; // stop if user cancels

    try {
      const response = await axios.patch(`${API_URL}/user/approve-user/${id}`);

      // 2️⃣ Success Handling
      if (response.status === 200 || response.status === 201) {
        alert("User approved successfully ✅");

        // 3️⃣ Reload page
        //window.location.reload();

        setPendingUsers((prev) => prev.filter((user) => user.user_id !== id));
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error(error);

      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert("Server not reachable");
      }
    }
  };

  const handleDelete = async (id) => {
    // 1️⃣ Confirmation Alert
    const isConfirmed = window.confirm(
      "Are you sure you want to reject this request?"
    );

    if (!isConfirmed) return;

    try {
      const response = await axios.delete(
        `${API_URL}/user/delete-user/${id}`
      );

      // 2️⃣ Success Handling
      if (response.status === 200 || response.status === 201) {
        alert("Request deleted successfully ✅");

        // 3️⃣ Remove user from UI immediately
        setPendingUsers((prev) =>
          prev.filter((user) => user.user_id !== id)
        );
      } else {
        alert(response.data.message);
      }

    } catch (error) {
      console.error("Delete User Error:", error);

      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert("Server not reachable");
      }
    }
  };


  const formatDate = (dateString) => {
    const date = new Date(dateString);

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="pending-request-page">
      <div className="pending-req-header">
        <h1>Pending Requests</h1>
      </div>
      <div className="pending-req-container">
        {pendingUsers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-animation"></div>
            <h2>No Pending Requests 🎉</h2>
            <p>You're all caught up. Nothing to review right now.</p>
          </div>
        ) : (
          pendingUsers.map((request) => (
            <div className="pending-request-card" key={request.id}>
              <div className="card-top">
                <img src={`/images/teacher.png`} alt="Teacher" />
                <h2>{request.name}</h2>
                <span className="badge">Teacher</span>
              </div>

              <div className="card-details">
                <div>
                  <span>Designation</span>
                  <p>{request.user_Desig}</p>
                </div>
                <div>
                  <span>Institution ID</span>
                  <p>{request.institute_id}</p>
                </div>
                <div>
                  <span>Request Date</span>
                  <p>{formatDate(request.created_at)}</p>
                </div>
                <div>
                  <span>
                    {" "}
                    <img
                      src={"/images/arroba.jpeg"}
                      className="phn-pend-req"
                      alt="email"
                    />
                    Email
                  </span>
                  <p> {request.user_email}</p>
                </div>
                <div>
                  <span>
                    {" "}
                    <img
                      src={"/images/old-typical-phone.jpeg"}
                      className="phn-pend-req"
                      alt="phone"
                    />{" "}
                    Mobile
                  </span>
                  <p>{request.user_mobile}</p>
                </div>
              </div>

              <div className="pending-request-btns">
                <button
                  className="approve-btn"
                  onClick={() => handleApprove(request.user_id)}
                >
                  Approve
                </button>
                <button className="reject-btn"
                  onClick={() => handleDelete(request.user_id)}
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* {showDialog && (
                <div className="admin-success-popup">
                    <p>✅ Admin Registered Successfully!</p>
                    <button  onClick={() => setShowDialog(false)}>OK</button>
                </div>
        )} */}
    </div>
  );
};
export default PendingRequest;

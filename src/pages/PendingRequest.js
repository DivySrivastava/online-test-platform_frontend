import React, { useState, useEffect, useRef } from "react";
import "./css/PendingRequest.css";
import axios from "axios";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const PendingRequest = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL;

  // 🔧 Carousel state
  const [activeIndex, setActiveIndex] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [slideStep, setSlideStep] = useState(364);

  const carouselViewportRef = useRef(null);

  // 🔧 Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    type: null,
    userId: null,
    message: "",
  });

  // 🔧 Result dialog state
  const [resultDialog, setResultDialog] = useState({
    show: false,
    success: true,
    message: "",
  });

  useEffect(() => {
    axios
      .get(`${API_URL}/user/pending-users`)
      .then((res) => {
        const users = res.data.data;

        const sortedUsers = [...users].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );

        setPendingUsers(sortedUsers);
      })
      .catch((err) => console.error(err));
  }, []);

  // 🔧 Reset carousel when users change
  useEffect(() => {
    if (pendingUsers.length > 0) {
      setActiveIndex(0);
      setCarouselIndex(pendingUsers.length > 1 ? 1 : 0);
      setIsTransitioning(true);
    }
  }, [pendingUsers.length]);

  useEffect(() => {
    const updateSlideStep = () => {
      const slide =
        carouselViewportRef.current?.querySelector(".carousel-slide");

      if (slide) {
        const style = window.getComputedStyle(slide);

        const marginLeft = parseFloat(style.marginLeft) || 0;
        const marginRight = parseFloat(style.marginRight) || 0;

        const totalWidth = slide.offsetWidth + marginLeft + marginRight;

        setSlideStep(totalWidth);
      }
    };

    updateSlideStep();

    window.addEventListener("resize", updateSlideStep);

    return () => {
      window.removeEventListener("resize", updateSlideStep);
    };
  }, [pendingUsers]);

  const showResult = (success, message) => {
    setResultDialog({ show: true, success, message });
  };

  const closeResultDialog = () => {
    setResultDialog({ show: false, success: true, message: "" });
  };

  // 🔧 Opens the modern confirm dialog
  const openConfirmDialog = (type, id) => {
    setConfirmDialog({
      show: true,
      type,
      userId: id,
      message:
        type === "approve"
          ? "Are you sure you want to approve this user?"
          : "Are you sure you want to reject this request?",
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      show: false,
      type: null,
      userId: null,
      message: "",
    });
  };

  // 🔧 Called when user confirms
  const handleConfirmAction = async () => {
    const { type, userId } = confirmDialog;

    closeConfirmDialog();

    if (type === "approve") {
      await approveUser(userId);
    } else if (type === "reject") {
      await rejectUser(userId);
    }
  };

  const approveUser = async (id) => {
    try {
      const response = await axios.patch(`${API_URL}/user/approve-user/${id}`);

      if (response.status === 200 || response.status === 201) {
        showResult(true, "User approved successfully ✅");

        setPendingUsers((prev) => prev.filter((user) => user.user_id !== id));
      } else {
        showResult(false, response.data.message);
      }
    } catch (error) {
      console.error(error);

      if (error.response) {
        showResult(false, error.response.data.message);
      } else {
        showResult(false, "Server not reachable");
      }
    }
  };

  const rejectUser = async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/user/delete-user/${id}`);

      if (response.status === 200 || response.status === 201) {
        showResult(true, "Request deleted successfully ✅");

        setPendingUsers((prev) => prev.filter((user) => user.user_id !== id));
      } else {
        showResult(false, response.data.message);
      }
    } catch (error) {
      console.error("Delete User Error:", error);

      if (error.response) {
        showResult(false, error.response.data.message);
      } else {
        showResult(false, "Server not reachable");
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

  // 🔧 Previous - Infinite Loop
  const goPrev = () => {
    if (pendingUsers.length <= 1) return;

    setIsTransitioning(true);

    setCarouselIndex((prev) => prev - 1);

    setActiveIndex((prev) => (prev === 0 ? pendingUsers.length - 1 : prev - 1));
  };

  // 🔧 Next - Infinite Loop
  const goNext = () => {
    if (pendingUsers.length <= 1) return;

    setIsTransitioning(true);

    setCarouselIndex((prev) => prev + 1);

    setActiveIndex((prev) => (prev === pendingUsers.length - 1 ? 0 : prev + 1));
  };

  // 🔧 Dot click
  const goToSlide = (index) => {
    if (pendingUsers.length <= 1) return;

    setIsTransitioning(true);
    setActiveIndex(index);
    setCarouselIndex(index + 1);
  };

  // 🔧 Handle clone transition
  const handleTransitionEnd = () => {
    if (pendingUsers.length <= 1) return;

    // Passed last real card -> jump to first real card
    if (carouselIndex === pendingUsers.length + 1) {
      setIsTransitioning(false);
      setCarouselIndex(1);
      return;
    }

    // Passed first real card backwards -> jump to last real card
    if (carouselIndex === 0) {
      setIsTransitioning(false);
      setCarouselIndex(pendingUsers.length);
    }
  };

  // 🔧 Re-enable transition after invisible jump
  useEffect(() => {
    if (isTransitioning) return;

    const timer = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsTransitioning(true);
      });
    });

    return () => cancelAnimationFrame(timer);
  }, [isTransitioning]);

  // 🔧 Create cloned cards for seamless infinite loop
  const carouselUsers =
    pendingUsers.length > 1
      ? [
          pendingUsers[pendingUsers.length - 1],
          ...pendingUsers,
          pendingUsers[0],
        ]
      : pendingUsers;

  const renderPendingCard = (request) => (
    <div className="pending-request-card">
      {/* CARD TOP */}
      <div className="card-top">
        <img src="/images/teacher.png" alt="Teacher" />

        <h2>{request.name}</h2>

        <span className="badge">Teacher</span>
      </div>

      {/* CARD DETAILS */}
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
            <img
              src="/images/old-typical-phone.jpeg"
              className="phn-pend-req"
              alt="phone"
            />
            Mobile
          </span>

          <p title={request.user_mobile}>{request.user_mobile}</p>
        </div>

        <div className="email-field">
          <span>
            <img
              src="/images/arroba.jpeg"
              className="phn-pend-req"
              alt="email"
            />
            Email
          </span>

          <p title={request.user_email}>{request.user_email}</p>
        </div>
      </div>

      {/* BUTTONS */}
      <div className="pending-request-btns">
        <button
          className="approve-btn"
          onClick={(e) => {
            e.stopPropagation();
            openConfirmDialog("approve", request.user_id);
          }}
        >
          Approve
        </button>

        <button
          className="reject-btn"
          onClick={(e) => {
            e.stopPropagation();
            openConfirmDialog("reject", request.user_id);
          }}
        >
          Reject
        </button>
      </div>
    </div>
  );

  return (
    <div className="pending-request-page">
      <div className="pending-req-header">
        <h1>Pending Requests</h1>
      </div>

      {/* =========================
        EMPTY / CAROUSEL
       ========================= */}

      {pendingUsers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-animation"></div>

          <h2>No Pending Requests 🎉</h2>

          <p>You're all caught up. Nothing to review right now.</p>
        </div>
      ) : (
        <div className="carousel-wrapper">
          {/* LEFT ARROW */}
          <button
            className="carousel-arrow arrow-left"
            onClick={goPrev}
            aria-label="Previous"
          >
            <FaChevronLeft />
          </button>

          {/* VIEWPORT */}
          <div className="carousel-viewport" ref={carouselViewportRef}>
            <div
              className="carousel-slider"
              onTransitionEnd={handleTransitionEnd}
              style={{
                left: "50%",
                transform:
                  carouselIndex === 0 && pendingUsers.length === 1
                    ? "translateX(-50%)"
                    : `translateX(calc(-${carouselIndex * slideStep}px - 160px))`,
                transition: isTransitioning
                  ? "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)"
                  : "none",
              }}
            >
              {pendingUsers.length === 1 ? (
                <div className="carousel-slide active">
                  {renderPendingCard(pendingUsers[0])}
                </div>
              ) : (
                carouselUsers.map((request, index) => (
                  <div
                    className={`carousel-slide ${
                      index === carouselIndex ? "active" : ""
                    }`}
                    key={`${request.user_id}-${index}`}
                    onClick={() => {
                      if (index === carouselIndex) return;

                      const realIndex =
                        (index - 1 + pendingUsers.length) % pendingUsers.length;

                      goToSlide(realIndex);
                    }}
                  >
                    {renderPendingCard(request)}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT ARROW */}
          <button
            className="carousel-arrow arrow-right"
            onClick={goNext}
            aria-label="Next"
          >
            <FaChevronRight />
          </button>

          {/* DOTS */}
          {pendingUsers.length > 1 && (
            <div className="carousel-dots">
              {pendingUsers.map((_, index) => (
                <span
                  key={index}
                  className={`dot ${index === activeIndex ? "active" : ""}`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================
        CONFIRMATION DIALOG
       ========================= */}

      {confirmDialog.show && (
        <div className="pr-dialog-overlay">
          <div className="pr-dialog-box">
            <div
              className={`pr-dialog-icon ${
                confirmDialog.type === "approve"
                  ? "icon-approve"
                  : "icon-reject"
              }`}
            >
              {confirmDialog.type === "approve" ? "✔" : "✕"}
            </div>

            <h3>
              {confirmDialog.type === "approve"
                ? "Approve Request?"
                : "Reject Request?"}
            </h3>

            <p>{confirmDialog.message}</p>

            <div className="pr-dialog-btns">
              <button
                className={
                  confirmDialog.type === "approve"
                    ? "pr-btn-confirm-approve"
                    : "pr-btn-confirm-reject"
                }
                onClick={handleConfirmAction}
              >
                {confirmDialog.type === "approve" ? "Approve" : "Reject"}
              </button>

              <button className="pr-btn-cancel" onClick={closeConfirmDialog}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
        RESULT DIALOG
       ========================= */}

      {resultDialog.show && (
        <div className="pr-dialog-overlay">
          <div className="pr-dialog-box">
            <div
              className={`pr-dialog-icon ${
                resultDialog.success ? "icon-success" : "icon-error"
              }`}
            >
              {resultDialog.success ? "✔" : "✕"}
            </div>

            <h3>{resultDialog.success ? "Success" : "Something went wrong"}</h3>

            <p>{resultDialog.message}</p>

            <div className="pr-dialog-btns">
              <button className="pr-btn-ok" onClick={closeResultDialog}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingRequest;

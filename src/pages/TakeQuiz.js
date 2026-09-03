import React, { useState, useEffect, useRef, useContext } from "react";
import "./css/TakeQuiz.css";
import { useNavigate } from "react-router-dom";
import { useAxios } from "../api/axiosInstance";
import { UserContext } from "../contexts/UserContext";
import { openRazorpay } from "../utils/paymentHelper";
import { waitForFinalStatus } from "../utils/paymentHelper";
import { checkPaymentStatus } from "../utils/paymentHelper";

const TakeQuiz = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [paymentAction, setPaymentAction] = useState("");

  const [showPaymentResultModal, setShowPaymentResultModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(""); // "SUCCESS" or "FAILED"
  const [paymentMessage, setPaymentMessage] = useState("");

  const [username, setUsername] = useState("");
  const [pricing, setPricing] = useState(false);
  const [purchasedTests, setPurchasedTests] = useState({});
  const API_URL = process.env.REACT_APP_API_URL;
  const axios = useAxios();
  const { user } = useContext(UserContext);

  const [allTests, setAllTests] = useState([]);

  const [filters, setFilters] = useState({
    quizState: "",
    visibility: "",
    language: "",
    pricing: "",
  });

  useEffect(() => {
    const storedUsername = localStorage.getItem("authIdentifier");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    //console.log("User in Take Quiz:", user);

    axios
      .get(`${API_URL}/test/approvedTests/${user.username}`)
      .then((response) => {
        console.log("API Response:", response.data);

        const updatedTests = response.data.map((test) => ({
          ...test,
          pricing: test.test_fees > 0 ? "Paid" : "Free",
          fee: test.test_fees || 0,
        }));

        setAllTests(updatedTests);
        setTests(updatedTests);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);

        if (error.response) {
          // Server responded with an error (4xx/5xx)
          console.log("Status Code:", error.response.status);
          console.log("Response Data:", error.response.data);
        } else if (error.request) {
          // Request made but no response received
          console.log("No response received from server.");
          console.log(error.request);
        } else {
          // Something happened while setting up the request
          console.log("Error Message:", error.message);
        }
      });
  }, [username]);

  useEffect(() => {
    let filtered = [...allTests];

    // Quiz State
    if (filters.quizState) {
      if (filters.quizState === "live") {
        filtered = filtered.filter((test) => test.test_status === "Live");
      }

      if (filters.quizState === "coming") {
        filtered = filtered.filter((test) => test.test_status === "Active");
      }

      if (filters.quizState === "expired") {
        filtered = filtered.filter((test) => test.test_status === "Expired");
      }
    }

    // Visibility
    if (filters.visibility) {
      filtered = filtered.filter(
        (test) => test.test_visibility === filters.visibility,
      );
    }

    // Language
    if (filters.language) {
      filtered = filtered.filter((test) => test.test_lang === filters.language);
    }

    // Pricing
    if (filters.pricing) {
      filtered = filtered.filter(
        (test) => test.pricing.toLowerCase() === filters.pricing,
      );
    }

    console.log("Pricing Filter --> ", filters.pricing);

    setTests(filtered);

    console.log("Filtered --> ", filtered);
  }, [filters, allTests]);

  useEffect(() => {
    if (user) {
      getPurchasedTests();
    }
  }, [user]);

  // const waitForFinalStatus = async (orderId) => {

  //   for (let i = 0; i < 5; i++) {

  //     const res = await checkPaymentStatus(orderId);

  //     if (
  //       res &&
  //       ["CAPTURED", "FAILED", "REFUNDED"].includes(res.status)
  //     ) {

  //       return res;

  //     }

  //     await new Promise(resolve => setTimeout(resolve, 2000));

  //   }

  //   return {

  //     status: "PENDING"

  //   };

  // }

  const getPurchasedTests = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/payment/purchased-tests/${user.id}`,
      );

      const purchasedMap = {};

      res.data.purchasedTests.forEach((item) => {
        purchasedMap[item.test_id] = true;
      });

      console.log("Purchase-->", purchasedMap);

      setPurchasedTests(purchasedMap);
    } catch (err) {
      console.log(err);
    }
  };

  const handlePayment = async (test, action) => {
    try {
      const res = await axios.post(`${API_URL}/payment/create-order`, {
        student_id: user.id,
        test_id: test.test_id,
      });

      console.log(res.data);

      const callbacks = {
        setPaymentStatus,

        setPaymentMessage,

        setShowPaymentResultModal,

        setPurchasedTests,

        handleTest,

        onSuccess: null,
      };

      openRazorpay(
        res.data,

        test,

        "PLAY",

        user,

        axios,

        API_URL,

        callbacks,
      );
    } catch (err) {
      console.log("err");
      console.log(err);

      alert(err.response?.data?.message || "Unable to create order.");
    }
  };

  const clearFilters = () => {
    setFilters({
      quizState: "",
      visibility: "",
      language: "",
      pricing: "",
    });

    setTests(allTests);
  };

  const handleTest = (test) => {
    if (test.test_status === "Active") {
      alert(`Test will be live on ${test.test_date}`);
    } else if (test.test_status === "Live") {
      navigate(`/test/${test.test_id}`, {
        state: { test }, // 👈 pass full object here
      });
    }
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isFilterOpen &&
        filterRef.current &&
        !filterRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterOpen]);

  // const tests1 = [
  //   {
  //     name: "Sample Name",
  //     description: "Test Description",
  //     status: "Live",
  //     from: "01 August, 2025",
  //     to: "31 August, 2025",
  //     questions: 20,
  //     duration: 20,
  //     pricing: "Free",
  //   },
  //   {
  //     name: "Sample Name",
  //     description: "Test Description",
  //     status: "Live",
  //     from: "01 August, 2025",
  //     to: "31 August, 2025",
  //     questions: 25,
  //     duration: 30,
  //     pricing: "Paid",
  //     fee: "$10",
  //   },
  //   {
  //     name: "Schedule and Paid",
  //     description: "Description for Schedule and paid",
  //     status: "Coming soon",
  //     from: "01 August, 2025",
  //     to: "31 August, 2025",
  //     questions: 20,
  //     duration: 20,
  //     pricing: "Paid",
  //     fee: "$20",
  //   },
  // ];

  const handleQuiz = (name) => {
    alert(`Hello, ${name}!`);
  };
  return (
    <div className="take-quiz">
      {/* Mobile / Tablet Filter Backdrop */}
      {isFilterOpen && (
        <div
          className="filter-backdrop"
          onClick={() => setIsFilterOpen(false)}
        ></div>
      )}

      <div className="Sticky-filterby">
        <div
          className={`filter-section ${isFilterOpen ? "filter-section--open" : ""}`}
          ref={filterRef}
        >
          <h2>Filter By</h2>
          <hr />
          <div className="filter-group">
            <label>Quiz State</label>
            <select
              value={filters.quizState}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  quizState: e.target.value,
                })
              }
            >
              <option value="">All</option>
              <option value="live">Live</option>
              <option value="coming">Coming Soon</option>
              {/* <option value="expired">Expired</option>               */}
            </select>
          </div>

          {user && user.role_id == 4 && (
            <>
              <hr />
              <div className="filter-group">
                <label>Quiz Visibility</label>
                <select
                  value={filters.visibility}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      visibility: e.target.value,
                    })
                  }
                >
                  <option value="">All</option>
                  <option value="Institution">Institutional Quiz</option>
                  <option value="Global">Global</option>
                  <option value="Interest">Interest Based</option>
                </select>
              </div>
            </>
          )}
          <hr />
          <div className="filter-group">
            <label>Language</label>
            <select
              value={filters.language}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  language: e.target.value,
                })
              }
            >
              <option value="">All</option>
              <option value="english">English</option>
              <option value="hindi">Hindi</option>
              <option value="both">English and Hindi</option>
            </select>
          </div>

          {user && user.role_id == 4 && (
            <>
              {/* <hr />
              <div className="filter-group">
                <label>Categories</label>
                <select>
                  <option value="">All Categories</option>
                  <option value="general">General</option>
                  <option value="academic">Academic</option>
                  <option value="competitive">Competitive</option>
                  <option value="mock">Mock</option>
                </select>
              </div> */}
            </>
          )}
          <hr />
          <div className="filter-group">
            <label>Pricing</label>
            <select
              value={filters.pricing}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  pricing: e.target.value,
                })
              }
            >
              <option value="">All</option>
              <option value="free">Unpaid</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          <div className="su-clear-filter" onClick={clearFilters}>
            Clear Search & Filter
          </div>
        </div>
      </div>
      <div className="take-quiz-main-section">
        <div className="take-quiz-header">
          <h1>Take Quiz</h1>
          <div className="filter-toggle-wrapper">
            <button
              className="filter-toggle-button"
              onClick={toggleFilter}
              ref={buttonRef}
            >
              {isFilterOpen ? "Hide Filters" : "Filter By"}
            </button>
          </div>
        </div>
        <div className="test-container-row">
          {tests.length === 0 ? (
            <div className="no-quiz-box">
              <div className="no-quiz-animation"></div>
              <p className="no-quiz-text">No Quiz Available</p>
            </div>
          ) : (
            tests.map((test, index) => (
              <div
                className="test-card"
                key={test.test_id}
                // onClick={() => handleTest(test)}
              >
                <h3>{test.test_name}</h3>
                <p className="desc">
                  {/* <strong>Test description: </strong> */}
                  {test.test_description}
                </p>

                <div className="Status-Lang">
                  <span className="test-status1">
                    {test.test_status === "Live" && (
                      <>
                        <strong>Status: </strong>
                        <i>Live</i>
                      </>
                    )}

                    {test.test_status === "Active" && (
                      <>
                        <span className="test-status2">
                          <strong>Status: </strong>
                          <i>Coming Soon</i>
                        </span>
                      </>
                    )}
                  </span>
                  <span className="test-lang">
                    <strong>Language: </strong>
                    {test.test_lang === "both" && <i>English and Hindi</i>}

                    {test.test_lang === "english" && <i>English</i>}

                    {test.test_lang === "hindi" && <i>Hindi</i>}
                  </span>
                </div>

                <div className="from-to">
                  <p>
                    <strong>From: </strong>
                    {new Date(test.start_date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <p>
                    <strong>To: </strong>
                    {new Date(test.end_date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="from-to">
                  <p>
                    {test.start_date
                      ? new Date(
                          test.start_date.replace(" ", "T"),
                        ).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: false,
                          timeZone: "Asia/Kolkata",
                        })
                      : "N/A"}{" "}
                    (IST)
                  </p>

                  <p>
                    {test.end_date
                      ? new Date(
                          test.end_date.replace(" ", "T"),
                        ).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: false,
                          timeZone: "Asia/Kolkata",
                        })
                      : "N/A"}{" "}
                    (IST)
                  </p>
                </div>
                <div className="test-details">
                  <div className="detail-item">
                    <img
                      src={"/images/question.png"}
                      alt="questions"
                      className="icon-TakeQuiz"
                    />
                    <p>
                      {/* <strong>{test.no_of_ques} Questions</strong> */}
                      <strong>
                        {test.test_lang === "both"
                          ? test.no_of_ques / 2
                          : test.no_of_ques}{" "}
                        Questions
                      </strong>
                    </p>
                  </div>
                  <div className="vl"></div>
                  <div className="detail-item">
                    <img
                      src={"/images/clock.png"}
                      alt="Duration"
                      className="icon-TakeQuiz"
                    />
                    <p>
                      <strong>{test.test_duration} Minutes</strong>
                    </p>
                  </div>
                  {test.pricing === "Paid" && (
                    <>
                      <div className="vl"></div>
                      <div className="detail-item">
                        <img
                          src={"/images/fee.png"}
                          alt="Fee"
                          className="icon-TakeQuiz"
                        />
                        <p>
                          <strong>Rs.{test.fee} Fees</strong>
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <div className="test-footer">
                  <div>
                    <img
                      src={"/images/certificate.png"}
                      alt="Certificate"
                      className="icon-TakeQuiz"
                    />
                    E-Certificate
                  </div>
                  <div>
                    <img
                      src={"/images/terms-and-conditions.png"}
                      alt="Terms & Conditions"
                      className="icon-TakeQuiz"
                    />
                    View T&C
                  </div>
                </div>

                {/* ================= FREE + LIVE ================= */}

                {test &&
                  test.test_status === "Live" &&
                  test.pricing === "Free" && (
                    <button
                      className="play-button"
                      onClick={() => handleTest(test)}
                    >
                      Play
                    </button>
                  )}

                {/* ================= PAID + LIVE ================= */}

                {test &&
                  test.test_status === "Live" &&
                  test.pricing === "Paid" &&
                  (purchasedTests[test.test_id] ? (
                    <button
                      className="play-button"
                      onClick={() => handleTest(test)}
                    >
                      Play
                    </button>
                  ) : (
                    <button
                      className="play-button"
                      // onClick={() => handlePayment(test, "PLAY")}
                      onClick={() => {
                        setSelectedTest(test);
                        setPaymentAction("PLAY");
                        setShowPaymentModal(true);
                      }}
                    >
                      Pay to Play Quiz
                    </button>
                  ))}

                {/* ================= FREE + APPROVED ================= */}

                {test &&
                  test.test_status === "Active" &&
                  test.pricing === "Free" && (
                    <button className="play-button" disabled>
                      Play
                    </button>
                  )}

                {/* ================= PAID + APPROVED ================= */}

                {test &&
                  test.test_status === "Active" &&
                  test.pricing === "Paid" &&
                  (purchasedTests[test.test_id] ? (
                    <button className="play-button" disabled>
                      Enrolled
                    </button>
                  ) : (
                    <button
                      className="play-button"
                      // onClick={() => handlePayment(test, "ENROLL")}
                      onClick={() => {
                        setSelectedTest(test);
                        setPaymentAction("ENROLL");
                        setShowPaymentModal(true);
                      }}
                    >
                      Pay to Enroll in Quiz
                    </button>
                  ))}

                {/* <button className="play-button">
                {test.pricing === 'Paid'? (test.test_status==="Live"? "Pay to Play Quiz" : "Pay to enroll in quiz"):"Play"}  
              </button> */}
                <br />
                <br />
                <hr />
                <p className="last-p">
                  By:{" "}
                  {test.test_visibility === "Institution"
                    ? "Institute"
                    : "SAHASH"}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
      {showPaymentModal && (
        <div className="payment-modal-overlay">
          <div className="payment-modal">
            <h2>Payment Instructions</h2>

            <ul>
              <li>Please complete the payment without refreshing the page.</li>
              <li>Do not close the browser during payment.</li>
              <li>
                After successful payment, your quiz will be unlocked
                automatically.
              </li>
              <li>
                If the amount is deducted but payment fails, it will usually be
                refunded within 5–7 working days.
              </li>
              <li>Please ensure you have a stable internet connection.</li>
            </ul>

            <div className="payment-modal-buttons">
              <button
                className="cancel-btn"
                onClick={() => setShowPaymentModal(false)}
              >
                Cancel
              </button>

              <button
                className="ok-btn"
                onClick={() => {
                  setShowPaymentModal(false);

                  if (selectedTest) {
                    handlePayment(selectedTest, paymentAction);
                  }

                  setSelectedTest(null);
                  setPaymentAction("");
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      {showPaymentResultModal && (
        <div className="payment-result-overlay">
          <div className="payment-result-modal">
            <div
              className={
                paymentStatus === "SUCCESS"
                  ? "payment-success-icon"
                  : "payment-failed-icon"
              }
            >
              {paymentStatus === "SUCCESS" ? "✅" : "❌"}
            </div>

            <h2>
              {paymentStatus === "SUCCESS"
                ? "Payment Successful"
                : "Payment Failed"}
            </h2>

            <p>{paymentMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeQuiz;

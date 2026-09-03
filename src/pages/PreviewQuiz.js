import React, { useState, useEffect, useRef, useContext } from "react";
import "./css/PreviewQuiz.css";
import { useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import CertificateReport from "../CertificateReport";
import { useAxios } from "../api/axiosInstance";
import { UserContext } from "../contexts/UserContext";
import { QuizContext } from "../contexts/QuizContext";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

//TestDetails component: Manages a quiz interface with answers , submission, and result display.
function PreviewQuiz() {
  //state to control visiblity of info and details sections, selected answers, submission status, popup visibility, and time tracking
  const API_URL = process.env.REACT_APP_API_URL;
  const location = useLocation();
  const previewSource = location.state?.previewSource || "backend";
  const previewQuestions = location.state?.previewQuestions || [];
  const previewTest = location.state?.previewTest;
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [pendingQuestions, setpendingQuestions] = useState([]);
  const axios = useAxios();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [startTime] = useState(Date.now());
  const [timeTaken, setTimeTaken] = useState(0);
  //For countdown timer
  const [totalMarks, setTotalMarks] = useState(0); // 25 minutes in seconds
  const [testDuration, setTestDuration] = useState(0); // 25 minutes in seconds
  const [timeLeft, setTimeLeft] = useState(null); // 25 minutes in seconds

  const { id, lang } = useParams();
  const [questions, setQuestions] = useState([]);
  const [testLang, setTestLang] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [test, setTest] = useState(null);
  const [passingStatus, setPassingStatus] = useState("");
  const [institute, setInstitute] = useState(null);
  const scoreRef = useRef(null);
  const childRef = useRef();
  const date = new Date();
  const date_time = date.toISOString().split("T")[0]; // '2025-06-22'
  const navigate = useNavigate();

  const { user } = useContext(UserContext);

  // Snackbar state
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const { formData, englishQuestionOptionsList, hindiQuestionOptionsList } =
    useContext(QuizContext);

  const handleCloseSnackbar = (_, reason) => {
    if (reason === "clickaway") return;
    setOpenSnackbar(false);
  };

  const optionMap = {
    option_a: "a",
    option_b: "b",
    option_c: "c",
    option_d: "d",
  };

  useEffect(() => {
    if (previewSource === "context") {
      setQuestions(previewQuestions);

      const totalMarks = previewQuestions.reduce(
        (sum, q) => sum + (q.marks || 0),
        0,
      );

      setTotalMarks(totalMarks);
      return;
    }

    const fetchQuestions = async () => {
      try {
        const url = lang
          ? `${API_URL}/test/tests/${id}/${lang}/questions`
          : `${API_URL}/test/tests/${id}/questions`;

        console.log(url);

        const res = await axios.get(url);

        if (res.data.length === 0) {
          alert("This quiz contains 0 questions.");
          navigate(-1);
          return;
        }

        setQuestions(res.data || []);

        console.log("Questions -->", res.data);

        const totalMarks = res.data.reduce((sum, q) => sum + (q.marks || 0), 0);

        setTotalMarks(totalMarks);
      } catch (err) {
        console.error("Error fetching questions:", err);
      }
    };

    fetchQuestions();
  }, [id, lang, previewSource]);

  useEffect(() => {
    if (previewSource === "context") {
      setTest(previewTest);

      setTestDuration(previewTest.test_duration);
      setTimeLeft(previewTest.test_duration * 60);

      if (lang) setTestLang(lang);
      else setTestLang(previewTest.test_lang);

      return;
    }

    if (id) {
      axios
        .get(`${API_URL}/test/tests/${id}`)
        .then((res) => {
          if (res.data && res.data.test_duration) {
            setTest(res.data);
            console.log("res.data -->", res.data);

            setTimeLeft(res.data.test_duration * 60);
            setTestDuration(res.data.test_duration);
            if (lang) {
              setTestLang(lang);
            } else {
              setTestLang(res.data.test_lang);
            }
          } else {
            console.error("Test data invalid:", res.data);
          }
        })
        .catch((err) => console.error("Error fetching Test Details:", err));
    }
  }, [id, lang, previewSource]);

  //Refs to handle clicks outside the info and details sections
  const infoRef = useRef(null);
  const buttonRef = useRef(null);
  const detailsRef = useRef(null);
  const detailsButtonRef = useRef(null);

  //Toggle functions to open and close info and details sections and details sections

  function toggleDetails() {
    setIsDetailsOpen(!isDetailsOpen);
  }

  //Effect to handle clicks outside the info and details sections to close them
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        isInfoOpen &&
        infoRef.current &&
        !infoRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsInfoOpen(false);
      }
      if (
        isDetailsOpen &&
        detailsRef.current &&
        !detailsRef.current.contains(event.target) &&
        detailsButtonRef.current &&
        !detailsButtonRef.current.contains(event.target)
      ) {
        setIsDetailsOpen(false);
      }
    }
    // Add event listener for mousedown to detect clicks outside the sections

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isInfoOpen, isDetailsOpen]);

  function formatDuration(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    let parts = [];
    if (hrs > 0) parts.push(`${hrs} hr`);
    if (mins > 0) parts.push(`${mins} min`);
    if (hrs === 0 && mins === 0 && secs > 0) parts.push(`${secs} sec`);

    return parts.length > 0 ? parts.join(" ") : "0 min";
  }

  return (
    <div className="test-submission">
      {/*<div className="bg-animation">
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
      </div>*/}
      <div className="top-Quiz-Banner"></div>

      {/* MOBILE INFORMATION - TOP */}
      <div className="mobile-info-section">
        <div className="mobile-info-left">
          <div>
            <h4>
              <img
                src="/images/chronometer.png"
                alt="counter Icon"
                className="icon"
              />
              Duration
            </h4>
            <p>{formatDuration(testDuration * 60)}</p>
          </div>

          <div>
            <h4>
              <img
                src="/images/question.png"
                alt="question Icon"
                className="icon"
              />
              Questions
            </h4>
            <p>{questions.length}</p>
          </div>
        </div>

        <div className="mobile-info-right">
          <button className="details-toggle" onClick={toggleDetails}>
            {isDetailsOpen ? "Hide Information" : "Information"}
          </button>

          {isDetailsOpen && (
            <div className="details-dropdown" ref={detailsRef}>
              <h4>Information</h4>

              <hr />

              <h4>
                <img
                  src="/images/chronometer.png"
                  alt="counter Icon"
                  className="icon"
                />
                Duration
              </h4>
              <p>{formatDuration(testDuration * 60)}</p>

              <h4>
                <img
                  src="/images/question.png"
                  alt="question Icon"
                  className="icon"
                />
                Number of Questions
              </h4>
              <p>{questions.length}</p>

              <hr />

              <h4>
                Don't refresh or close the quiz otherwise your test will get
                submitted.
              </h4>

              <hr />

              <div className="submit-button-container">
                <button onClick={() => navigate(-1)}>Back To Quiz</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/**Sticky info panel */}
      <div className="Sticky-Info">
        <div
          className={`Info-section ${isInfoOpen ? "Info-section--open" : ""} ${isSubmitted ? "Info-section--submitted" : ""}`}
          ref={infoRef}
        >
          <h2>Information</h2>
          <hr></hr>
          <div className="Info-group">
            <>
              {/**Display 
instructions before submission
              */}
              <h4>
                <img
                  src={"/images/chronometer.png"}
                  alt="counter Icon"
                  className="icon"
                />
                Duration:
              </h4>
              <p>{formatDuration(testDuration * 60)}</p>

              <h4>
                <img
                  src={"/images/question.png"}
                  alt="question Icon"
                  className="icon"
                />
                Number of Questions:{" "}
              </h4>
              <p>{questions.length}</p>

              <hr />
              <h4>
                Don't refresh or close the quiz otherwise your test will get
                submitted.
              </h4>

              <hr />
              <div className="submit-button-container">
                <button onClick={() => navigate(-1)}>Back To Quiz</button>
              </div>
            </>
          </div>
        </div>
      </div>
      {/**Main quiz content section  */}
      <div className="test-submission-section">
        <div className="test-submission-header">
          {test && <h1>{test.test_name} Quiz</h1>}
        </div>
        {/* Render quiz questions and options */}
        <div className="ques-container-row">
          {questions.map((quesVal, index) => (
            <div className="ques-card" key={index}>
              <div className="pack-h4-marks">
                {test && testLang === "hindi" && (
                  <>
                    <h4>
                      प्रश्न{index + 1}. {quesVal.question_text}
                    </h4>
                    <span className="points">अंक: {quesVal.marks}</span>
                  </>
                )}

                {test && testLang === "english" && (
                  <>
                    <h4>
                      Q{index + 1}. {quesVal.question_text}
                    </h4>
                    <span className="points">Points: {quesVal.marks}</span>
                  </>
                )}
              </div>
              <div className="options-container">
                {["option_a", "option_b", "option_c", "option_d"].map(
                  (option, index) => (
                    <label
                      key={index}
                      className={`option-label ${
                        isSubmitted &&
                        optionMap[option] === quesVal.correct_answer
                          ? "correct-answer"
                          : isSubmitted &&
                              selectedAnswers[quesVal.question_id] ===
                                optionMap[option] &&
                              optionMap[option] !== quesVal.correct_answer
                            ? "incorrect-answer"
                            : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${quesVal.question_id}`}
                        value={optionMap[option]}
                        checked={
                          selectedAnswers[quesVal.question_id] ===
                          optionMap[option]
                        }
                        disabled
                      />
                      {quesVal[option]}
                      {optionMap[option] === quesVal.correct_answer && (
                        <span>✅</span>
                      )}
                    </label>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PreviewQuiz;

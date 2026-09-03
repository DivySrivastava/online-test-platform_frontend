import React, { useState, useEffect, useRef, useContext } from "react";
import "./css/Quiz.css";
import { useParams } from "react-router-dom";
import CertificateReport from "../CertificateReport";
import { useAxios } from "../api/axiosInstance";
import { UserContext } from "../contexts/UserContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

//TestDetails component: Manages a quiz interface with answers , submission, and result display.
function Quiz() {
  //state to control visiblity of info and details sections, selected answers, submission status, popup visibility, and time tracking
  const API_URL = process.env.REACT_APP_API_URL;
  const [isRedirecting, setIsRedirecting] = useState(false);
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
  const [correctAnswer, setCorrectAnswer] = useState(0); // 25 minutes in seconds
  const [wrongAnswer, setWrongAnswer] = useState(0); // 25 minutes in seconds
  const isSubmittingRef = useRef(false);

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

  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  //Effect for countdown timer
  useEffect(() => {
    let timer;
    if (!isSubmitted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSubmit(); // Automatically submit when time runs out
    }
    return () => clearInterval(timer);
  });

  const optionMap = {
    option_a: "a",
    option_b: "b",
    option_c: "c",
    option_d: "d",
  };

  const handleAnswerChange = (questionId, selectedOptionKey) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionMap[selectedOptionKey],
    }));
  };

  const handleShowScore = () => {
    setShowAnswers(true);
    scoreRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDownloadCertificate = async () => {
    const certificateData = {
      test_name: test.test_name,
      test_id: test.test_id,
      student_name: user.name,
      standard: user.standard_type,
      institute_data: institute,
      test_date: date_time,
    };
    childRef.current.generateParticipationCertificate(certificateData);
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const url = lang
          ? `${API_URL}/test/tests/${id}/${lang}/questions`
          : `${API_URL}/test/tests/${id}/questions`;

        const res = await axios.get(url);
        const shuffledQuestions = shuffleArray(res.data || []);
        setQuestions(shuffledQuestions);
        // ✅ Calculate total marks
        const totalMarks = shuffledQuestions.reduce(
          (sum, q) => sum + (q.marks || 0),
          0,
        );

        setTotalMarks(totalMarks);
        console.log("Total Marks:", totalMarks);
      } catch (err) {
        console.error("Error fetching questions:", err);
      }
    };

    fetchQuestions();
  }, [id, lang]);

  useEffect(() => {
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
  }, [id]);

  //Refs to handle clicks outside the info and details sections
  const infoRef = useRef(null);
  const buttonRef = useRef(null);
  const detailsRef = useRef(null);
  const detailsButtonRef = useRef(null);

  //Toggle functions to open and close info and details sections and details sections

  function toggleDetails() {
    setIsDetailsOpen(!isDetailsOpen);
  }

  function shuffleArray(array) {
    const arr = [...array]; // original ko mutate na karein
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
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

  //Functions to handle option selection
  function handleOptionChange(questionId, option) {
    // only allow selection if the quiz is not submitted
    setpendingQuestions((prev) => {
      // If already included, return same array
      if (prev.includes(questionId)) return prev;
      // Otherwise, add new id
      return [...prev, questionId];
    });

    if (!isSubmitted) {
      setSelectedAnswers((prev) => ({
        ...prev,
        [questionId]: option,
      }));
    }
  }

  function handleSubmit() {
    // Prevent duplicate submission
    if (isSubmittingRef.current) {
      console.log("⚠️ Submission already in progress.");
      return;
    }
    isSubmittingRef.current = true;

    setIsSubmitted((prev) => {
      if (!prev) {
        setIsPopupOpen(false);

        // const endTime = Date.now();
        const timeInSeconds = Math.floor(testDuration * 60 - timeLeft);
        setTimeTaken(timeInSeconds);

        const status = results.score < test.passing_marks ? "Fail" : "Pass";
        setPassingStatus(status); // still updates UI if needed

        let quizData = getQuizResults();

        const answers = questions.map((question) => ({
          question_id: question.question_id,
          selected_answer: selectedAnswers[question.question_id] || null,
        }));

        console.log("Student Answers:", answers);

        const submissionData = {
          student_id: user.id,
          test_id: id,
          max_marks: test.max_marks,
          test_name: test.test_name,
          marks: quizData.score,
          time_taken: timeInSeconds,
          submit_date: date_time,
          passing_status: status,
          correct_answer: quizData.correct,
          wrong_answer: quizData.incorrect,
          test_lang: testLang,
          answers: answers,
        };

        console.log("Submitting with data:", submissionData);

        const TOAST_DURATION = 3000;

        axios
          .post(`${API_URL}/test/submit-test`, submissionData)
          .then((res) => {
            console.log("Test submitted successfully:", res.data);
            setIsRedirecting(true); // 👈 result section की जगह overlay दिखाना शुरू करें
            toast.success("🎉 Your quiz is submitted successfully!", {
              position: "top-center",
              autoClose: TOAST_DURATION,
            });
            setTimeout(() => {
              navigate("/dashboard/past-quizzes");
            }, TOAST_DURATION + 300);
          })
          .catch((err) => {
            if (err.response)
              console.error("Backend error:", err.response.data);
            else console.error("Axios error:", err.message);

            toast.error("Failed to submit quiz. Please try again.");
            isSubmittingRef.current = false; // allow retry after a failed submission
          });

        if (user.institute_id != null) {
          axios
            .get(`${API_URL}/institute/institutions/${user.institute_id}`)
            .then((res) => {
              if (res.data?.institute_id) {
                setInstitute(res.data);
                console.log("Institute Data:", res.data);
              } else {
                console.error("Invalid institute data:", res.data);
              }
            })
            .catch((err) => {
              console.error(err.response?.data || err.message);
            });
        }
      }
      return true;
    });
  }

  function handleConfirmationForSubmit() {
    // Calculate time taken from start time to now
    console.log("Questions", questions.length);
    console.log("pending ques", pendingQuestions);

    const timeInSeconds = Math.floor(testDuration * 60 - timeLeft);
    const timeInMinutes = Math.ceil(timeInSeconds / 60.0);
    setTimeTaken(timeInSeconds);
    //setIsSubmitted(true);
    if (timeLeft === 0) {
      setIsPopupOpen(false);
      //setIsSubmitted(true);
    } else {
      setIsPopupOpen(true);
    }
  }
  //Function to handle closing the popup after submission
  function handleClosePopup() {
    setIsPopupOpen(false);
  }

  //Function to handle closing the popup after submission
  function handleCancelPopup() {
    setIsPopupOpen(false);
  }

  function handleDownloadReport() {
    console.log("Downloading report...");
  }

  //Function to calculate quiz results after submission
  function getQuizResults() {
    let score = 0;
    let answered = 0;
    let correct = 0;
    let incorrect = 0;
    // Iterate through quiz cards to calculate score, answered, unanswered, correct, and incorrect counts
    for (let i = 0; i < questions.length; i++) {
      const quiz = questions[i];
      if (selectedAnswers[quiz.question_id]) {
        answered++;
        if (selectedAnswers[quiz.question_id] === quiz.correct_answer) {
          score++;
          correct++;
        } else {
          incorrect++;
        }
      }
    }

    const unanswered = questions.length - answered;

    return { score, answered, unanswered, correct, incorrect };
  }

  //Function to format time in MM:SS format
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  // Calculate results only if the quiz is submitted
  const results = isSubmitted
    ? getQuizResults()
    : { score: 0, answered: 0, unanswered: 0, correct: 0, incorrect: 0 };

  // Render the component
  return (
    <div className="test-submission">
      {/*<div className="bg-animation">
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
        <div className="circle"></div>
      </div>*/}
      {isRedirecting ? (
        <div className="submit-transition-overlay">
          <div className="submit-transition-spinner"></div>
          <p>Redirecting you to your quizzes...</p>
        </div>
      ) : (
        <>
          <div className="top-Quiz-Banner"></div>
          {/**Sticky info panel */}
          <div className="Sticky-Info">
            <div
              className={`Info-section ${isInfoOpen ? "Info-section--open" : ""} ${isSubmitted ? "Info-section--submitted" : ""}`}
              ref={infoRef}
            >
              <h2>Information</h2>
              <hr></hr>
              <div className="Info-group">
                {isSubmitted ? (
                  <>
                    {/**Display quiz result after submisssion */}
                    <hr />
                    <div className="pack-h4-p">
                      <h4>
                        <img
                          src={"/images/chronometer.png"}
                          alt="counter Icon"
                          className="icon"
                        />
                        Time Taken:{" "}
                      </h4>
                    </div>
                    <p>{formatTime(timeTaken)}</p>
                    <hr></hr>
                    <div className="pack-h4-p">
                      <h4>
                        <img
                          src={"/images/achievement.png"}
                          alt="score"
                          className="icon"
                        ></img>
                        Score:
                      </h4>
                    </div>
                    <p>
                      {results.score} / {totalMarks}
                    </p>

                    <hr />
                    <div className="pack-h4-p">
                      <h4>
                        <img
                          src={"/images/answer.png"}
                          alt="answer Icon"
                          className="icon"
                        />
                        Answered Questions:
                      </h4>
                    </div>
                    <p>{results.answered}</p>
                    <hr />
                    <div className="pack-h4-p">
                      <h4>
                        <img
                          src={"/images/question.png"}
                          alt="unanswered Icon"
                          className="icon"
                        />
                        Unanswered Questions:
                      </h4>
                    </div>
                    <p>{results.unanswered}</p>
                    <hr />
                    <div className="pack-h4-p">
                      <h4>
                        <img
                          src={"/images/check.png"}
                          alt="correct Icon"
                          className="icon"
                        />
                        Correct Questions:
                      </h4>
                    </div>
                    <p>{results.correct}</p>

                    <hr />
                    <div className="pack-h4-p">
                      <h4>
                        <img
                          src={"/images/no.png"}
                          alt="incorrect Icon"
                          className="icon"
                        />
                        Incorrect Questions:
                      </h4>
                    </div>
                    <p>{results.incorrect}</p>

                    <hr />
                    <div className="submit-button-container">
                      <button onClick={handleDownloadCertificate}>
                        Download Certificate
                      </button>
                      {/* <button onClick={handleDownloadReport}>Download Report</button> */}
                    </div>
                  </>
                ) : (
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
                      Time Left:
                    </h4>
                    <p>{formatTime(timeLeft)}</p>

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
                      Don't refresh or close the quiz otherwise your test will
                      get submitted.
                    </h4>

                    <hr />
                    <div className="submit-button-container">
                      <button
                        type="submit"
                        onClick={handleConfirmationForSubmit}
                      >
                        Submit
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          {/**Main quiz content section  */}
          <div className="test-submission-section">
            <div className="test-submission-header">
              {test && <h1>{test.test_name} Quiz</h1>}
            </div>
            {/* Mobile-specific information and controls */}
            <div className="mobile-info-section">
              {!isSubmitted ? (
                <>
                  <div className="mobile-info-left">
                    <h4>
                      <img
                        src={"/images/chronometer.png"}
                        alt="time-Icon"
                        className="icon"
                      ></img>{" "}
                      Time Left:
                      {formatTime(timeLeft)}
                    </h4>
                    <h4>
                      <img
                        src={"/images/question.png"}
                        alt="questions"
                        className="icon"
                      ></img>
                      No. of Questions: {questions.length}
                    </h4>
                  </div>
                  <div className="mobile-info-right">
                    <p>Don't refresh The page</p>
                    <p>Don't close the page</p>
                  </div>
                </>
              ) : (
                <div className="mobile-info-right">
                  <button
                    className="details-toggle"
                    onClick={toggleDetails}
                    ref={detailsButtonRef}
                  >
                    Quiz Details
                  </button>
                  {isDetailsOpen && (
                    <div className="details-dropdown" ref={detailsRef}>
                      <h4>
                        <img
                          src={"/images/chronometer.png"}
                          alt="counter Icon"
                          className="icon"
                        />
                        Time Taken:
                      </h4>
                      <p>{formatTime(timeTaken)}</p>
                      <h4>
                        <img
                          src={"/images/achievement.png"}
                          alt="score Icon"
                          className="icon"
                        />
                        Score:
                      </h4>
                      <p>
                        {results.score} / {totalMarks}
                      </p>
                      <h4>
                        <img
                          src={"/images/answer.png"}
                          alt="answered Icon"
                          className="icon"
                        />
                        Answered Questions:
                      </h4>
                      <p>{results.answered}</p>
                      <h4>
                        <img
                          src={"/images/question.png"}
                          alt="unanswered Icon"
                          className="icon"
                        />
                        Unanswered Questions:
                      </h4>
                      <p>{results.unanswered}</p>
                      <h4>
                        <img
                          src={"/images/check.png"}
                          alt="correct Icon"
                          className="icon"
                        />
                        Correct Questions:
                      </h4>
                      <p>{results.correct}</p>
                      <h4>
                        <img
                          src={"/images/no.png"}
                          alt="incorrect Icon"
                          className="icon"
                        />
                        Incorrect Questions:
                      </h4>
                      <p>{results.incorrect}</p>

                      <div className="submit-button-container">
                        <button onClick={handleDownloadCertificate}>
                          Download Certificate
                        </button>
                        {/*<button onClick={handleDownloadReport}>Download Report</button>*/}
                      </div>
                    </div>
                  )}
                </div>
              )}
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
                            onChange={() =>
                              handleOptionChange(
                                quesVal.question_id,
                                optionMap[option],
                              )
                            }
                            disabled={isSubmitted}
                          />
                          {quesVal[option]}
                          {isSubmitted &&
                            optionMap[option] === quesVal.correct_answer && (
                              <span>✅</span>
                            )}

                          {isSubmitted &&
                            selectedAnswers[quesVal.question_id] ===
                              optionMap[option] &&
                            optionMap[option] !== quesVal.correct_answer && (
                              <span>❌</span>
                            )}
                        </label>
                      ),
                    )}
                  </div>
                  {isSubmitted && (
                    <p>
                      <b>Reason: </b>
                      {quesVal.answer_description}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {/* Submit button at the bottom (hidden after submission) */}
            {!isSubmitted && (
              <button
                type="submit"
                className="bottom-submit-button"
                onClick={handleConfirmationForSubmit}
              >
                Submit
              </button>
            )}{" "}
            {/*****i have removed comments from here */}
            {/**SUbmission confirmation popup */}
            {isPopupOpen && (
              <div className="submission-popup">
                <div className="popup-content">
                  <div className="popup-icon-wrapper">
                    <svg className="popup-warning-icon" viewBox="0 0 52 52">
                      <circle
                        className="popup-warning-circle"
                        cx="26"
                        cy="26"
                        r="24"
                        fill="none"
                      />
                      <line
                        className="popup-warning-line"
                        x1="26"
                        y1="15"
                        x2="26"
                        y2="29"
                      />
                      <circle
                        className="popup-warning-dot"
                        cx="26"
                        cy="37"
                        r="1.5"
                      />
                    </svg>
                  </div>

                  <h2>Are you sure to submit?</h2>

                  {questions.length - pendingQuestions.length > 0 && (
                    <p className="popup-warning-text">
                      ⚠️ {questions.length - pendingQuestions.length}{" "}
                      question(s) still left unanswered
                    </p>
                  )}

                  <div className="popup-button-container">
                    <button
                      className="popup-btn-confirm"
                      onClick={handleSubmit}
                    >
                      Yes, Submit
                    </button>
                    <button
                      className="popup-btn-cancel"
                      onClick={handleCancelPopup}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
      <CertificateReport ref={childRef} />
    </div>
  );
}

export default Quiz;

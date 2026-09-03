import React, { useState, useEffect, useRef, useContext } from 'react';
import './css/Quiz.css';
import { useParams } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../UserContext";

//TestDetails component: Manages a quiz interface with answers , submission, and result display.
function Quiz() {
  //state to control visiblity of info and details sections, selected answers, submission status, popup visibility, and time tracking
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [startTime] = useState(Date.now());
  const [timeTaken, setTimeTaken] = useState(0);
  //For countdown timer
  const [timeLeft, setTimeLeft] = useState(4*60); // 4 minutes in seconds


  const { id, lang } = useParams();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  // const [timeLeft, setTimeLeft] = useState(0);
  const [test, setTest] = useState(null);
  const [passingStatus, setPassingStatus] = useState("");
  const [institute, setInstitute] = useState(null);
  const scoreRef = useRef(null);
  const childRef = useRef();
  const date = new Date();
  const date_time = date.toISOString().split('T')[0]; // '2025-06-22'

  const { user } = useContext(UserContext);
  


  const optionMap = {
    option_a: "a",
    option_b: "b",
    option_c: "c",
    option_d: "d",
  };

  const handleAnswerChange = (questionId, selectedOptionKey) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionMap[selectedOptionKey]
    }));
  };


  

  const handleShowScore = () => {
    setShowAnswers(true);
    scoreRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDuration = () => {
    setShowAnswers(true);
    scoreRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
   const url = lang
    ? `http://localhost:5000/test/tests/${id}/${lang}/questions`
    : `http://localhost:5000/test/tests/${id}/questions`;

     axios.get(url)
    .then(res => setQuestions(res.data || []))
    .catch(err => console.error("Error fetching questions:", err));
  }, [id, lang]); // ✅ Include lang as a dependency

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:5000/test/tests/${id}`)
        .then((res) => {
          if (res.data && res.data.test_duration) {
            setTest(res.data);
            console.log("res.data", res.data);
            if(res.data.test_date){
              handleDuration(res.data);
            } 
            else{
                setTimeLeft(res.data.test_duration * 60);
            }           
            
          } else {
            console.error("Test data invalid:", res.data);
          }
        })
        .catch(err => console.error("Error fetching Test Details:", err));
    }
  }, [id]);
/*
  useEffect(() => {
    if (score !== null) return;
    if (timeLeft === 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, score]);
creating errors and counting in -ve 
*/
  //Refs to handle clicks outside the info and details sections
  const infoRef = useRef(null);
  const buttonRef = useRef(null);
  const detailsRef = useRef(null);
  const detailsButtonRef = useRef(null);

  //Smaple data for QUiz cards
  const quizCards = [
    {
      id: 1,
      question: "What is the full form of RAM?",
      options: ["Random Access Memory", "Read Reccess Memory", "Read and Write Access Memory", "Read Access Manager"],
      answer: "Random Access Memory",
      description: "RAM stands for Random Access Memory."
    },
    {
      id: 2,
      question: "What is the full form of CPU?",
      options: ["Central Processing Unit", "Control Processing Unit", "Central Programming Unit", "Central Protocol unit"],
      answer: "Central Processing Unit",
      description: "CPU stands for Central Processing Unit."
    },
    {
      id: 2,
      question: "What is the full form of CPU?",
      options: ["Central Processing Unit", "Control Processing Unit", "Central Programming Unit", "Central Protocol unit"],
      answer: "Central Processing Unit",
      description: "CPU stands for Central Processing Unit."
    },
    {
      id: 3,
      question: "What is the full form of GPU?",
      options: ["Graphics Processing Unit", "Graphical Processing Unit", "Graphical Programming Unit", "Graphics Putting unit"],
      answer: "Graphics Processing Unit",
      description: "GPU stands for Graphics Processing Unit."
    },
    {
      id: 4,
      question: "What is the full form of PSU?",
      options: ["Power Solution Unit", "Power Supply Unit", "Process Supply Unit", "Power Scheduling Unit"],
      answer: "Power Supply Unit",
      description: "PSU stands for Power Supply Unit."
    },
    {
      id: 5,
      question: "What is the full form of FTP?",
      options: ["File Transmission Protocol", "File Transfer Process", "File Transfer Protocol", "File Transaction Protocol"],
      answer: "File Transfer Protocol",
      description: "FTP stands for File Transfer Protocol."
    }
  ];

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

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isInfoOpen, isDetailsOpen]);

  //Effect for countdown timer
  useEffect(()=>{
    if (isSubmitted || timeLeft <= 0){
      if (!isSubmitted && timeLeft <= 0){
        handleSubmit(); //Auto-submit when time ends
      }
      return;
    }
    const timer = setInterval(()=>{
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return()=> clearInterval(timer);//cleanup timer...
  }, [isSubmitted, timeLeft]);


  //Functions to handle option selection
  function handleOptionChange(questionId, option) {
    // only allow selection if the quiz is not submitted
    if (!isSubmitted) {
      setSelectedAnswers({ ...selectedAnswers, [questionId]: option });
    }
  }

  const handleSubmit = () => {
    if (isSubmitted) return; // Prevent multiple submissions
    const endTime = Date.now();
    const timeInSeconds = Math.floor((endTime - startTime) / 1000);
    setTimeTaken(timeInSeconds);
    setIsSubmitted(true);
    setIsPopupOpen(true);
    setTimeLeft(0); // Stop the timer
  };
  
//Function to handle closing the popup after submission
  function handleClosePopup() {
    setIsPopupOpen(false);
  }
//Function to handle downloading certificate and report
  function handleDownloadCertificate() {
    console.log('Downloading certificate...');
  
  }

  function handleDownloadReport() {
    console.log('Downloading report...');
    
  }

  //Function to calculate quiz results after submission
  function getQuizResults() {
    let score = 0;
    let answered = 0;
    let correct = 0;
    let incorrect = 0;
// Iterate through quiz cards to calculate score, answered, unanswered, correct, and incorrect counts
    for (let i = 0; i < quizCards.length; i++) {
      const quiz = quizCards[i];
      if (selectedAnswers[quiz.id]) {
        answered++;
        if (selectedAnswers[quiz.id] === quiz.answer) {
          score++;
          correct++;
        } else {
          incorrect++;
        }
      }
    }

    const unanswered = quizCards.length - answered;

    return { score, answered, unanswered, correct, incorrect };
  }

  //Function to format time in MM:SS format
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Calculate results only if the quiz is submitted
  const results = isSubmitted ? getQuizResults() : { score: 0, answered: 0, unanswered: 0, correct: 0, incorrect: 0 };

  // Render the component
  return (
    <div className="test-submission">
      {/**Sticky info panel */}
      <div className="Sticky-Info">
        <div className={`Info-section ${isInfoOpen ? 'Info-section--open' : ''} ${isSubmitted ? 'Info-section--submitted' : ''}`} ref={infoRef}>
          <h2>Information</h2>
          <hr></hr>
          <div className="Info-group">
            {isSubmitted ? (
              <>
              {/**Display quiz result after submisssion */}
              <hr />
              <div className='pack-h4-p'>
                <h4>
                  <img src={'/chronometer.png'} alt="counter Icon" className="icon" />
                  Time Taken: </h4>
                </div>
                <p>{formatTime(timeTaken)}</p>
                <hr></hr>
              <div className='pack-h4-p'>
                <h4> 
                  <img src={'/achievement.png'} alt='score' className='icon'></img>
                Score:</h4>
              </div>
                <p>{results.score} / {quizCards.length}</p>
              
              <hr />
              <div className='pack-h4-p'>
                <h4>
                  <img src={'/answer.png'} alt="answer Icon" className="icon" />  
                  Answered Questions:</h4>
                </div>
                <p>{results.answered}</p>
                <hr />
                <div className='pack-h4-p'>
                <h4> 
                  <img src={'/question.png'} alt="unanswered Icon" className="icon" />  
                Unanswered Questions:</h4>
                </div>
                <p>{results.unanswered}</p>
                <hr />
                <div className='pack-h4-p'>
                <h4>
                  <img src={'/check.png'} alt="correct Icon" className="icon" />  
                  Correct Questions:</h4>
                  </div>
                <p>{results.correct}</p>
              
                <hr />
                <div className='pack-h4-p'>
                <h4>
                  <img src={'/no.png'} alt="incorrect Icon" className="icon" /> 
                 Incorrect Questions:</h4></div>
                <p>{results.incorrect}</p>
                
                <hr />
                <div className="submit-button-container">
                  <button className='quiz-btn' onClick={handleDownloadCertificate}>Download Certificate</button>
                  <button className='quiz-btn' onClick={handleDownloadReport}>Download Report</button>
                </div>
              </>
            ) : (
              <>
              {/**Display 
instructions before submission
              */}
                <h4>
                  <img src={'/chronometer.png'} alt="counter Icon" className="icon" />  
                  Time Left:</h4>
                <p>{formatTime(timeLeft)}</p>
                
                <h4>
                  <img src={'/question.png'} alt="question Icon" className="icon" />   
                Number of Questions: </h4>
                <p>{questions.length}</p>
                

                <hr />
                <h4>Don't refresh The page</h4>
                <h4>Don't close the page</h4>
                <hr />
                <div className="submit-button-container">
                  <button className='quiz-btn' type="submit" onClick={handleSubmit}>
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
          {test &&(
            <h1>
             {test.test_name} Quiz
            </h1>
          )}
        </div>
        {/* Mobile-specific information and controls */}
        <div className="mobile-info-section">
          {!isSubmitted ? (
            <>
              <div className="mobile-info-left">
                 <h4> 
                  <img src={'/chronometer.png'} alt='time-Icon' className='icon'></img> Time Left:  
                 {formatTime(timeLeft)}
                 </h4>
                 <h4> 
                  <img src={'/question.png'} alt='questions' className='icon' />  
                  No. of Questions: {questions.length}</h4>
              </div>
              <div className="mobile-info-right">
                 <p>Don't refresh The page</p>
                <p>Don't close the page</p>
               {/**<button className="instructions-toggle" onClick={toggleInfo} ref={buttonRef}>
                  Instructions
                </button>
                {isInfoOpen && (
                  <div className="instructions-dropdown" ref={infoRef}>
                    <p>Don't refresh the page</p>
                    <p>Don't close the page</p>
                  </div>
                )}**/}
              </div>
            </>
          ) : (
            <div className="mobile-info-right">
              <button className="details-toggle quiz-btn" onClick={toggleDetails} ref= {detailsButtonRef}>
                 Quiz Details
              </button>
              {isDetailsOpen && (
                <div className="details-dropdown" ref={detailsRef}>
                  <h4> 
                    <img src={'/chronometer.png'} alt='counter Icon' className='icon' /> 
                  Time Taken:</h4>
                  <p>{formatTime(timeTaken)}</p>
                  <h4> 
                    <img src={'/achievement.png'} alt='score Icon' className='icon' /> 
                  Score:</h4>
                  <p>{results.score} / {questions.length}</p>
                  <h4>
                    <img src={'/answer.png'} alt='answered Icon' className='icon' /> 
                  Answered Questions:</h4>
                  <p>{results.answered}</p>
                  <h4>
                    <img src={'/question.png'} alt='unanswered Icon' className='icon' /> 
                  Unanswered Questions:</h4>
                  <p>{results.unanswered}</p>
                  <h4> 
                    <img src={'/check.png'} alt='correct Icon' className='icon' /> 
                  Correct Questions:</h4>
                  <p>{results.correct}</p>
                  <h4> 
                    <img src={'/no.png'} alt='incorrect Icon' className='icon' /> 
                  Incorrect Questions:</h4>
                  <p>{results.incorrect}</p>
                  <hr />
                  <div className="submit-button-container">
                    <button className='quiz-btn' onClick={handleDownloadCertificate}>Download Certificate</button>
                    <button className='quiz-btn' onClick={handleDownloadReport}>Download Report</button>
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
              <div className='pack-h4-marks'>
              {test && test.test_lang === 'hindi' &&(
                <>
                  <h4>
                    प्रश्न{index + 1}. {quesVal.question_text}
                  </h4> 
                  <span className='points'>
                    अंक: {quesVal.marks}
                  </span>
                </>
              )}
              </div>
              <div className="options-container">
                {["option_a", "option_b", "option_c", "option_d"].map((option, index) => (
                  <label
                    key={index}
                    className={`option-label ${
                      isSubmitted && optionMap[option] === quesVal.correct_answer
                        ? 'correct-answer'
                        : isSubmitted && selectedAnswers[quesVal.question_id] === optionMap[option] && optionMap[option] !== quesVal.correct_answer
                        ? 'incorrect-answer'
                        : ''
                    }`}
                  >
                    {isSubmitted && optionMap[option] === quesVal.correct_answer && (<span 
                    > 
                    ✅
                    </span>)}

                    {isSubmitted && optionMap[option] !== quesVal.correct_answer && (<span 
                    > 
                    ❌
                    </span>)}
                    <input
                      type="radio"
                      name={`question-${quesVal.question_id}`}
                      value={optionMap[option]}
                      checked={selectedAnswers[quesVal.question_id] === optionMap[option]}
                      onChange={() => handleOptionChange(quesVal.question_id, optionMap[option])}
                      disabled={isSubmitted}
                    />
                    {quesVal[option]}
                  </label>
                ))}
              </div>
              {isSubmitted && (
              <p ><b>Reason: </b>{quesVal.answer_description}</p>
              )}
            </div>
          ))}
        </div>
          {/* Submit button at the bottom (hidden after submission) */}
        {!isSubmitted && (
          <div className="bottom-submit-button">
            <button className='quiz-btn' type="submit" onClick={handleSubmit}>
              Submit
            </button>
          </div>
        )}
        {/**SUbmission confirmation popup */}
        {isPopupOpen && (
          <div className="submission-popup">
            <div className="popup-content">
              <h2>Submission Successful</h2>
              <button className='quiz-btn' onClick={handleClosePopup}>OK</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Quiz;










// import { useEffect, useState, useRef, useContext } from "react";
// import { useParams } from "react-router-dom";
// 

// import html2canvas from "html2canvas";
// 
// import "./css/Quiz.css";
// import CertificateReport from "../CertificateReport";

// function Quiz() {
//   const { id, lang } = useParams();
//   const [questions, setQuestions] = useState([]);
//   const [answers, setAnswers] = useState({});
//   const [score, setScore] = useState(null);
//   const [showAnswers, setShowAnswers] = useState(false);
//   const [showPopup, setShowPopup] = useState(false);
//   const [timeLeft, setTimeLeft] = useState(0);
//   const [test, setTest] = useState(null);
//   const [passingStatus, setPassingStatus] = useState("");
//   const [institute, setInstitute] = useState(null);
//   const scoreRef = useRef(null);
//   const childRef = useRef();
//   const date = new Date();
//   const date_time = date.toISOString().split('T')[0]; // '2025-06-22'

//   //const [loading, setLoading] = useState(false);

//   // Sample student data – in real use, you can get this from context or props


//     const timeString1 = date.toTimeString().split(" ")[0]; // "HH:MM:SS"
//     const timeString2 = test.test_date.split(" ")[1];
//     const [hh1, mm1, ss1] = timeString1.split(":").map(Number);
//     const [hh2, mm2, ss2] = timeString2.split(":").map(Number);

//     const currentTime = hh1 * 3600 + mm1 * 60 + ss1; 
//     const scheduledTime = hh2 * 3600 + mm2 * 60 + ss2; 
    
//     // const evaluatedDuration = Math.ceil((fixedDuration - (currentTime - scheduledTime))/60);
//     const evaluatedDuration = fixedDuration - (currentTime - scheduledTime);

//     setTimeLeft(evaluatedDuration);
//     console.log("Current Time",currentTime);
//     console.log("scheduledTime Time",scheduledTime);
//     console.log("fixedDuration Time",fixedDuration);
//     console.log("evaluatedDuration Time",evaluatedDuration);
    
//   };
//  // Empty array means run once (on mount)

//   // useEffect(() => {
//   //   if (!user?.user_id || score === null || !test?.test_duration) {

//   //     console.log("user",user);
//   //     console.log("score",score);
//   //     console.log("test",test);  

//   //     return;
//   //   };

//   //   const submissionData = {
//   //     student_id: user.user_id,
//   //     test_id: id,
//   //     marks: score,
//   //     time_taken: test.test_duration * 60 - timeLeft,
//   //     test_date: date_time
//   //   };

//   //   console.log("Submitting with data:", submissionData);

//   //   axios.post("http://localhost:5000/submit-test", submissionData)
//   //     .then(res => console.log("Test submitted successfully:", res.data))
//   //     .catch(err => {
//   //       if (err.response) console.error("Backend error:", err.response.data);
//   //       else console.error("Axios error:", err.message);
//   //     });
//   // }, [score, user?.user_id, test?.test_duration]);

//   const optionMap = {
//     option_a: "a",
//     option_b: "b",
//     option_c: "c",
//     option_d: "d",
//   };

//   const handleAnswerChange = (questionId, selectedOptionKey) => {
//     setAnswers(prev => ({
//       ...prev,
//       [questionId]: optionMap[selectedOptionKey]
//     }));
//   };

//   const submitFinalScore = (finalScore, status) => {
//     if (!user || !test || !test.test_duration) {
//       console.error("Missing user or test data during submission.");
//       return;
//     }

//     console.log("passingStatus"+ passingStatus);

//     const submissionData = {
//       student_id: user.id,
//       test_id: id,
//       max_marks: test.max_marks,
//       test_name: test.test_name,
//       marks: finalScore,
//       time_taken: test.test_duration * 60 - timeLeft,
//       submit_date: date_time,
//       passing_status: status
//     };

//     console.log("Submitting test with data:", submissionData);

//     axios.post("http://localhost:5000/submit-test", submissionData)
//       .then(res => console.log("Test submitted successfully:", res.data))
//       .catch(err => {
//         if (err.response) console.error("Backend error:", err.response.data);
//         else console.error("Axios error:", err.message);
//       });

//   //     console.log("user", user.institute_id);
//     if(user.institute_id === null || user.institute_id === undefined) return;
//      axios.get(`http://localhost:5000/institutions/${user.institute_id}`)
//       .then((res) => {
//           if (res.data && res.data.institute_id) {
//             setInstitute(res.data);
//             console.log("res.data", res.data);            
//           } else {
//             console.error("Institute:", res.data);
//           }
//         })
//       .catch(err => {
//         if (err.response) console.error("Backend error:", err.response.data);
//         else console.error("Axios error:", err.message);
//       }); 
//   };



//   const handleSubmit = () => {
//    if (!user) {
//     console.error("User not logged in");
//     return;
//   }

//   if (!test || !test.test_duration) {
//     console.error("Test details not loaded properly:", test);
//     return;
//   }

//   let correctAnswersCount = 0;
//   questions.forEach(q => {
//     const userAnswer = answers[q.question_id]?.toLowerCase();
//     const correctAnswer = q.correct_answer?.toLowerCase();
//     if (userAnswer && userAnswer === correctAnswer) correctAnswersCount++;
//   });

//   const finalScore = correctAnswersCount;
//   setScore(finalScore);

//   const status = finalScore < test.passing_marks ? "Fail" : "Pass";
//   setPassingStatus(status); // still updates UI if needed

//   setShowPopup(true);
//   submitFinalScore(finalScore, status); // pass explicitly

// };

//   const handleDownloadCertificate = async () => {
        
//        const certificateData = {
//         test_name: test.test_name,
//         test_id: test.test_id,
//         student_name: user.name,
//         standard: user.standard_type,        
//         institute_data: institute,        
//         test_date: date_time
//       };    
//       childRef.current.generateParticipationCertificate(certificateData);
//   };


  // const handleDownloadReport = async () => {
        
  //      const reportData = {
  //       test_id: test.test_id,
  //       user_id: user.id,  
  //       test_name: test.test_name,           
  //       test_date: date_time
  //     };    
  //     childRef.current.generateReport(reportData);
  // };

//   const formatTime = (seconds) => {
//     const m = Math.floor(seconds / 60);
//     const s = seconds % 60;
//     return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
//   };

//   return (
//     <div className="quiz-container">
//       <div className="quiz-header">
//         <h2>Test {id}</h2>
//       </div>

//       {!test ? (
//         <p>Loading test details...</p>
//       ) : (
//         <>
//           {score === null && (
//             <div className="timer">
//               <h3>Time Left: {formatTime(timeLeft)}</h3>
//             </div>
//           )}

//           <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
//             {questions.length > 0 ? (
//               questions.map((q, idx) => (
//                 <div key={q.question_id} className="question-box">
//                   <p><strong>प्रश्न{idx + 1}:</strong> {q.question_text}</p>

//                   {["option_a", "option_b", "option_c", "option_d"].map((opt, i) => {
//                     const isUserAns = answers[q.question_id] === optionMap[opt];
//                     const isCorrectAns = q.correct_answer === optionMap[opt];

//                     let className = "option-label";
//                     if (showAnswers) {
//                       if (isCorrectAns) className += " correct";
//                       else if (isUserAns && !isCorrectAns) className += " wrong";
//                     }

//                     return (
//                       <label key={i} className={className}>
//                         <input
//                           type="radio"
//                           name={`question_${q.question_id}`}
//                           value={opt}
//                           checked={answers[q.question_id] === optionMap[opt]}
//                           onChange={() => handleAnswerChange(q.question_id, opt)}
//                           disabled={showAnswers}
//                         />
//                         {q[opt]}
//                         {showAnswers && (
//                           <>
//                             {isCorrectAns && <span className="answer-icon"> ✅</span>}
//                             {isUserAns && !isCorrectAns && <span className="answer-icon"> ❌</span>}
//                           </>
//                         )}
//                       </label>
//                     );
//                   })}
//                   {showAnswers && (
//                     <div className="answer-description">
//                       <strong>Explanation:</strong> {q.answer_description}
//                     </div>
//                   )}
//                 </div>
//               ))
//             ) : (
//               <p>Loading questions...</p>
//             )}

//             {score === null && (
//               <button type="submit" className="submit-button">Submit Test</button>
//             )}
//           </form>

//           {showPopup && (
//             <div className="popup-overlay">
//               <div className="popup">
//                 <h2>Test Submitted!</h2>
//                 <button onClick={() => { handleShowScore(); setShowPopup(false); }} className="header-button">Show Score</button>
//                 <button onClick={() => { handleDownloadCertificate(); setShowPopup(false); }} className="header-button">Download Certificate</button>
//                 <button onClick={() => { handleDownloadReport(); setShowPopup(false); }} className="header-button">Download Report</button>
//               </div>
//             </div>
//           )}

//           {score !== null && (
//             <h2 ref={scoreRef}>Your Score: {score} / {questions.length}</h2>
//           ) }

//           <div id="certificate" style={{ display: "none", width: "900px", height: "400px", padding: "50px", border: "10px solid #2c3e50", textAlign: "center", fontFamily: "Georgia, serif", backgroundColor: "#fdfdfd" }}>
//             <h1 style={{ fontSize: "36px", color: "#2c3e50" }}>Certificate of Achievement</h1>
//             <p style={{ fontSize: "20px", marginTop: "30px" }}>This is awarded to</p>
//             <h2 style={{ fontSize: "28px", color: "#34495e" }}>{user.name}</h2>
//             <p style={{ fontSize: "20px", marginTop: "20px" }}>
//               for successfully completing <strong>Test ID: {id}</strong>
//             </p>
//             <p style={{ fontSize: "20px" }}>Score: {score} / {questions.length}</p>
//             <p style={{ marginTop: "60px", fontSize: "16px" }}>{new Date().toLocaleDateString()}</p>
//           </div>
//         </>
//       )}
//       <CertificateReport ref={childRef} />

//     </div>
//   );
// }

// export default Quiz;

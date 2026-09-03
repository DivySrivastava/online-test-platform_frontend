import React, { useState, useEffect, useRef, useContext } from 'react';
import './css/Quiz.css';
import { useParams } from "react-router-dom";
import { useAxios } from "../api/axiosInstance";
import { UserContext } from "../contexts/UserContext";


function QuizResult() {

    const API_URL = process.env.REACT_APP_API_URL;
    const axios = useAxios();

    const { id, lang } = useParams();
    const { user } = useContext(UserContext);

    // -------------------------
    // Test / Question Data
    // -------------------------

    const [test, setTest] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [selectedAnswers, setSelectedAnswers] = useState({});

    // -------------------------
    // Result Data
    // -------------------------

    const [results, setResults] = useState({
        score: 0,
        answered: 0,
        unanswered: 0,
        correct: 0,
        incorrect: 0
    });

    const [totalMarks, setTotalMarks] = useState(0);
    const [timeTaken, setTimeTaken] = useState(0);

    // -------------------------
    // UI State
    // -------------------------

    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const infoRef = useRef(null);
    const detailsRef = useRef(null);
    const detailsButtonRef = useRef(null);


    // -------------------------
    // Fetch Result
    // -------------------------

    useEffect(() => {

        const fetchResult = async () => {

            try {

                const response = await axios.get(
                    `${API_URL}/test/student-result/${id}`,
                    {
                        params: {
                            student_id: user?.id
                        }
                    }
                );


                const data = response.data;

                if (!data.success) {
                    return;
                }

                console.log("Result Data:", data);


                // -------------------------
                // Test
                // -------------------------

                setTest(data.test);

                setTotalMarks(data.test.max_marks);


                // -------------------------
                // Result
                // -------------------------

                setTimeTaken(data.result.time_taken);

                setResults({
                    score: data.result.marks,

                    answered:
                        data.result.correct_answers +
                        data.result.wrong_answers,

                    unanswered:
                        data.result.missed_answers,

                    correct:
                        data.result.correct_answers,

                    incorrect:
                        data.result.wrong_answers
                });


                // -------------------------
                // Questions
                // -------------------------

                setQuestions(data.questions);


                // -------------------------
                // Student Selected Answers
                // -------------------------

                const selectedAnswersObject = {};

                data.questions.forEach((question) => {

                    selectedAnswersObject[question.question_id] =
                        question.selected_answer;

                });

                setSelectedAnswers(selectedAnswersObject);


            } catch (error) {

                console.error(
                    "Error fetching result:",
                    error.response?.data || error.message
                );

            }

        };

        fetchResult();

    }, [id]);


    // -------------------------
    // Format Time
    // -------------------------

    const formatTime = (seconds) => {

        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;

        return `${mins} min ${secs} sec`;

    };


    // -------------------------
    // Toggle Details
    // -------------------------

    const toggleDetails = () => {
        setIsDetailsOpen(prev => !prev);
    };


    // -------------------------
    // Option Mapping
    // -------------------------

    const optionMap = {
        option_a: "a",
        option_b: "b",
        option_c: "c",
        option_d: "d"
    };


    // -------------------------
    // Render
    // -------------------------

    return (

        <div className="test-submission">

            <div className="top-Quiz-Banner">
            </div>


            {/* =========================
                Sticky Result Information
            ========================= */}

            <div className="Sticky-Info">

                <div
                    className={`Info-section ${isInfoOpen
                            ? 'Info-section--open'
                            : ''
                        }`}
                    ref={infoRef}
                >

                    <h2>Quiz Result</h2>

                    <hr />

                    <div className="Info-group">

                        <div className='pack-h4-p'>

                            <h4>
                                <img
                                    src="/images/chronometer.png"
                                    alt="counter Icon"
                                    className="icon"
                                />

                                Time Taken:
                            </h4>

                        </div>

                        <p>
                            {formatTime(timeTaken)}
                        </p>


                        <hr />


                        <div className='pack-h4-p'>

                            <h4>
                                <img
                                    src="/images/achievement.png"
                                    alt="score"
                                    className="icon"
                                />

                                Score:
                            </h4>

                        </div>

                        <p>
                            {results.score} / {totalMarks}
                        </p>


                        <hr />


                        <div className='pack-h4-p'>

                            <h4>
                                <img
                                    src="/images/answer.png"
                                    alt="answer Icon"
                                    className="icon"
                                />

                                Answered Questions:
                            </h4>

                        </div>

                        <p>
                            {results.answered}
                        </p>


                        <hr />


                        <div className='pack-h4-p'>

                            <h4>
                                <img
                                    src="/images/question.png"
                                    alt="unanswered Icon"
                                    className="icon"
                                />

                                Unanswered Questions:
                            </h4>

                        </div>

                        <p>
                            {results.unanswered}
                        </p>


                        <hr />


                        <div className='pack-h4-p'>

                            <h4>
                                <img
                                    src="/images/check.png"
                                    alt="correct Icon"
                                    className="icon"
                                />

                                Correct Questions:
                            </h4>

                        </div>

                        <p>
                            {results.correct}
                        </p>


                        <hr />


                        <div className='pack-h4-p'>

                            <h4>
                                <img
                                    src="/images/no.png"
                                    alt="incorrect Icon"
                                    className="icon"
                                />

                                Incorrect Questions:
                            </h4>

                        </div>

                        <p>
                            {results.incorrect}
                        </p>

                    </div>

                </div>

            </div>


            {/* =========================
                Main Result Section
            ========================= */}

            <div className="test-submission-section">

                <div className="test-submission-header">

                    {test && (

                        <h1>
                            {test.test_name} Quiz Result
                        </h1>

                    )}

                </div>


                {/* =========================
                    Mobile Result Information
                ========================= */}

                <div className="mobile-info-section">

                    <div className="mobile-info-right">

                        <button
                            className="details-toggle"
                            onClick={toggleDetails}
                            ref={detailsButtonRef}
                        >
                            Quiz Result
                        </button>


                        {isDetailsOpen && (

                            <div
                                className="details-dropdown"
                                ref={detailsRef}
                            >

                                <h4>

                                    <img
                                        src="/images/chronometer.png"
                                        alt="counter Icon"
                                        className="icon"
                                    />

                                    Time Taken:

                                </h4>

                                <p>
                                    {formatTime(timeTaken)}
                                </p>


                                <h4>

                                    <img
                                        src="/images/achievement.png"
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
                                        src="/images/answer.png"
                                        alt="answered Icon"
                                        className="icon"
                                    />

                                    Answered Questions:

                                </h4>

                                <p>
                                    {results.answered}
                                </p>


                                <h4>

                                    <img
                                        src="/images/question.png"
                                        alt="unanswered Icon"
                                        className="icon"
                                    />

                                    Unanswered Questions:

                                </h4>

                                <p>
                                    {results.unanswered}
                                </p>


                                <h4>

                                    <img
                                        src="/images/check.png"
                                        alt="correct Icon"
                                        className="icon"
                                    />

                                    Correct Questions:

                                </h4>

                                <p>
                                    {results.correct}
                                </p>


                                <h4>

                                    <img
                                        src="/images/no.png"
                                        alt="incorrect Icon"
                                        className="icon"
                                    />

                                    Incorrect Questions:

                                </h4>

                                <p>
                                    {results.incorrect}
                                </p>

                            </div>

                        )}

                    </div>

                </div>


                {/* =========================
                    Questions
                ========================= */}

                <div className="ques-container-row">

                    {questions.map((quesVal, index) => (

                        <div
                            className="ques-card"
                            key={quesVal.question_id}
                        >

                            <div className="pack-h4-marks">

                                {test?.test_lang === "hindi" ? (

                                    <>
                                        <h4>
                                            प्रश्न{index + 1}.{" "}
                                            {quesVal.question_text}
                                        </h4>

                                        <span className="points">
                                            अंक: {quesVal.marks}
                                        </span>
                                    </>

                                ) : (

                                    <>

                                        <h4>
                                            Q{index + 1}.{" "}
                                            {quesVal.question_text}
                                        </h4>

                                        <span className="points">
                                            Points: {quesVal.marks}
                                        </span>

                                    </>

                                )}

                            </div>


                            <div className="options-container">

                                {[
                                    "option_a",
                                    "option_b",
                                    "option_c",
                                    "option_d"
                                ].map((option) => {

                                    const optionValue =
                                        optionMap[option];

                                    const isCorrect =
                                        optionValue ===
                                        quesVal.correct_answer;

                                    const isSelected =
                                        selectedAnswers[
                                        quesVal.question_id
                                        ] === optionValue;

                                    const isWrong =
                                        isSelected &&
                                        !isCorrect;


                                    return (

                                        <label
                                            key={option}
                                            className={`option-label ${isCorrect
                                                    ? "correct-answer"
                                                    : isWrong
                                                        ? "incorrect-answer"
                                                        : ""
                                                }`}
                                        >

                                            <input
                                                type="radio"
                                                name={`question-${quesVal.question_id}`}
                                                value={optionValue}
                                                checked={isSelected}
                                                disabled
                                                readOnly
                                            />

                                            {quesVal[option]}


                                            {isCorrect && (
                                                <span>
                                                    ✅
                                                </span>
                                            )}


                                            {isWrong && (
                                                <span>
                                                    ❌
                                                </span>
                                            )}

                                        </label>

                                    );

                                })}

                            </div>


                            {/* Explanation */}

                            <p>
                                <b>Reason: </b>
                                {quesVal.answer_description}
                            </p>

                        </div>

                    ))}

                </div>

            </div>

        </div>

    );

}

export default QuizResult;
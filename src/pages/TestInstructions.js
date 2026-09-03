import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import './css/TestInstructions.css';

const TestInstructions = () => {
  // const instructions = {
  //   first: "This quiz contains 20 MCQ-based questions, each carrying distinct marks.",
  //   second: "The duration of the quiz is 30 minutes.",
  //   third: "You are not allowed to refresh, close, or change the window once the test starts; otherwise, you will not be able to submit the test.",
  //   fourth: "The language of the quiz is Hindi.",
  // };

  const location = useLocation();
  const { test } = location.state || {}; 

  const [selectedLang, setSelectedLang] = useState(null);

  const handleLangChange = (event) => {
    setSelectedLang(event.target.value);
  };

  return (
    <div className="instructions-container">
      <div className="inst-header">
        <h1>Instructions</h1>
      </div>
      <div className="inst-body">
        <ul>
          <li>👉 You must complete the quiz within {test.test_duration} minutes.</li>
          <li>
            👉 The quiz contains{" "}
            {test.test_lang === "both"
              ? test.no_of_ques / 2
              : test.no_of_ques}{" "}
            questions and all questions are MCQ type.
          </li>
          <li>👉 You can attempt the quiz only once.</li>
          <li>👉 Do not refresh or close the browser during the quiz.</li>
          <li>👉 Once submitted, you cannot reattempt or change your answers.</li>
          <li>👉 Ensure stable internet connectivity during the quiz.</li>
          <li>👉 Do not open new tabs, switch windows, or copy/paste during the quiz.</li>
          <li>👉 Any suspicious activity may lead to automatic submission or disqualification.</li>
          {test && test.test_lang == 'both' &&(
            <li>👉 Language of Quiz is both English and Hindi.</li>
          )}

          {test && test.test_lang == 'english' &&(
            <li>👉 Language of Quiz is English.</li>
          )}

          {test && test.test_lang == 'hindi' &&(
            <li>👉 Language of Quiz is Hindi.</li>
          )}
          
        </ul>
      
        {test && test.test_lang == 'both' &&(
          <>
            <div className="lang-selection" role="radiogroup" aria-label="Select quiz language">
              <h4>Select Language</h4>
              <div className="radio-group">
                <label htmlFor="lang-hindi">
                  <input
                    type="radio"
                    id="lang-hindi"
                    value="hindi"
                    checked={selectedLang === "hindi"}
                    onChange={handleLangChange}
                  />
                  Hindi
                </label>
                <label htmlFor="lang-english">
                  <input
                    type="radio"
                    id="lang-english"
                    value="english"
                    checked={selectedLang === "english"}
                    onChange={handleLangChange}
                  />
                  English
                </label>
              </div>
            </div>
          </>
        )}

      {/* <div className="lang-selection" role="radiogroup" aria-label="Select quiz language">
        <h4>Select Language</h4>
        <div className="radio-group">
          <label htmlFor="lang-hindi">
            <input
              type="radio"
              id="lang-hindi"
              value="Hindi"
              checked={selectedLang === "Hindi"}
              onChange={handleLangChange}
            />
            Hindi
          </label>
          <label htmlFor="lang-english">
            <input
              type="radio"
              id="lang-english"
              value="English"
              checked={selectedLang === "English"}
              onChange={handleLangChange}
            />
            English
          </label>
        </div>
      </div> */}

      <div className="start-button-container">
              <button className="start-button" 
              aria-label="Start the quiz"
              onClick={() => {
              const path = selectedLang ? `/start-test/${test.test_id}/${selectedLang}` : `/start-test/${test.test_id}`;
              window.location.href = path;
              }}>
                Start Quiz
              </button>
            </div>
      </div>
      {/* <div className="start-button-container">
        <button className="start-button" aria-label="Start the quiz">
          Start Quiz
        </button>
      </div> */}
    </div>
  );
};

export default TestInstructions;

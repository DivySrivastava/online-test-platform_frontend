import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { UserProvider } from "./contexts/UserContext";
import { QuizProvider } from "./contexts/QuizContext";
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <UserProvider>
      <QuizProvider>
        <App />
      </QuizProvider>
    </UserProvider>
  </BrowserRouter>,
);

reportWebVitals();

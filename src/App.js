import React, { useContext, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { LoaderProvider } from "./contexts/LoaderContext";
import GlobalLoader from "./components/GlobalLoader";
import SessionTimeoutToast from "./components/SessionTimeoutToast";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import { UserContext } from "./contexts/UserContext";
import axios from "axios";
import { setupAxiosInterceptors } from "./api/axiosSetup";
import Home from "./Home";
import Footer from "./footer";
import Signup from "./pages/Signup";
import Welcome from "./pages/Welcome";
import Manageusers from "./pages/Manageusers";
import ShowUsers from "./pages/ShowUsers";
import UserDetails from "./pages/UserDetails";
import PendingRequest from "./pages/PendingRequest";
import Managetests from "./pages/Managetests";
import Manageinstitutes from "./pages/ManageInstitutes";
import AdminForm from "./pages/AdminForm";
import InstituteRegistration from "./pages/InstituteRegistration";
import WinnerList from "./pages/WinnerList";

import Createquiz from "./pages/Createquiz";
import TestDetails from "./pages/TestDetails";
import TakeQuiz from "./pages/TakeQuiz";
import Acheivement from "./pages/Acheivement";
import Quiz from "./pages/Quiz";
import TestInstructions from "./pages/TestInstructions";
import PastTest from "./pages/PastTest";
import PaymentDetails from "./pages/PaymentDetails";
import ResetPassword from "./pages/ResetPassword";
import FullTestDetails from "./pages/FullTestDetails";
import Participants from "./pages/Participants";
import ProtectedRoute from "./ProtectedRoute";
// import StudentProfile from "./pages/profiles/StudentProfile";
import UserProfile from "./pages/UserProfile";
import UserPerformance from "./pages/UserPerformance";
import PaymentGateway from "./pages/PaymentGateway";
import PreviewQuiz from "./pages/PreviewQuiz";
import QuizResult from "./pages/QuizResult";

function App() {
  const { user, logoutUser } = useContext(UserContext);

  useEffect(() => {
    setupAxiosInterceptors(logoutUser);
  }, []);

  return (
    <>
      <LoaderProvider>
        <GlobalLoader />
        <SessionTimeoutToast />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="colored"
        />

        <div className="app-shell">
          <Navbar />

          <main className="app-main">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/reset-password/:token"
                element={<ResetPassword />}
              />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Welcome />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/manageuser"
                element={
                  <ProtectedRoute>
                    <Manageusers />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/manageinstitutes"
                element={
                  <ProtectedRoute>
                    <Manageinstitutes />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/winnerlist"
                element={
                  <ProtectedRoute>
                    <WinnerList />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/payment-gateway"
                element={
                  <ProtectedRoute>
                    <PaymentGateway />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/manageuser/adminregistration"
                element={
                  <ProtectedRoute>
                    <AdminForm />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/manageuser/showusers"
                element={
                  <ProtectedRoute>
                    <ShowUsers />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/manageuser/showusers/:userId"
                element={
                  <ProtectedRoute>
                    <UserDetails />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/manageuser/pendingrequests"
                element={
                  <ProtectedRoute>
                    <PendingRequest />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/managestudents"
                element={
                  <ProtectedRoute>
                    <ShowUsers />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/managequiz/quiz-detail/quiz-preview/:id/:lang"
                element={<PreviewQuiz />}
              />

              <Route
                path="/dashboard/manageinstitution/institutionregistration"
                element={
                  <ProtectedRoute>
                    <InstituteRegistration />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/quiz-result/:id"
                element={
                  <ProtectedRoute>
                    <QuizResult />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/createquiz"
                element={
                  <ProtectedRoute>
                    <Createquiz />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/createquiz/quiz-preview"
                element={
                  <ProtectedRoute>
                    <PreviewQuiz />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/managequiz"
                element={
                  <ProtectedRoute>
                    <TestDetails />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/past-quizzes"
                element={
                  <ProtectedRoute>
                    <PastTest />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/payment-details"
                element={
                  <ProtectedRoute>
                    <PaymentDetails />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/takequiz"
                element={
                  <ProtectedRoute>
                    <TakeQuiz />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/achievements"
                element={
                  <ProtectedRoute>
                    <Acheivement />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/performance"
                element={
                  <ProtectedRoute>
                    <UserPerformance />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/test/:id"
                element={
                  <ProtectedRoute>
                    <TestInstructions />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/start-test/:id/:lang"
                element={
                  <ProtectedRoute>
                    <Quiz />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/start-test/:id"
                element={
                  <ProtectedRoute>
                    <Quiz />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/managequiz/quiz-detail/:test_id/participants"
                element={
                  <ProtectedRoute>
                    <Participants />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard/managequiz/quiz-detail/:test_id"
                element={
                  <ProtectedRoute>
                    <FullTestDetails />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/resetpassword"
                element={
                  <ProtectedRoute>
                    <ResetPassword />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          <Footer />
        </div>
      </LoaderProvider>
    </>
  );
}

export default App;

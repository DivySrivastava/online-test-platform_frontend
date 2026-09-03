import React, { useState, useEffect, useContext, useRef } from 'react';
import './css/PastTest.css';
import { UserContext } from "../contexts/UserContext";
import CertificateReport from "../CertificateReport";
import { Link } from "react-router-dom";
import { useAxios } from "../api/axiosInstance";

const PastTest = () => {


  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);
  const buttonRef = useRef(null);
  const [tests, setTests] = useState([]);
  const [institute, setInstitute] = useState([]);
  const { user } = useContext(UserContext);
  const childRef = useRef();
  const user_id = user.id;
  const API_URL = process.env.REACT_APP_API_URL;
  const axios = useAxios();
  const [quizType, setQuizType] = useState("");
  const [passingStatus, setPassingStatus] = useState("");
  const [searchText, setSearchText] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    axios
      .get(`${API_URL}/test/pasttests/${user_id}`)
      .then((response) => {
        setTests(response.data || []);
        const data = response.data || [];

        console.log("Fetched data:", response.data);
      })
      .catch((error) => console.error("Error fetching data:", error));

    //console.log("User ID:", user_id);
  }, [user_id]);


  useEffect(() => {
    axios
      .get(`${API_URL}/institute/institutions/${user.institute_id}`)
      .then((response) => {
        setInstitute(response.data);
        //console.log("Fetched Institutions:", response.data);
      })
      .catch((error) => console.error("Error fetching data:", error));

    //console.log("User ID:", user_id);
  }, [user.institute_id]);

  const sortedTests = [...tests].sort(
    (a, b) => new Date(b.test_date) - new Date(a.test_date)
  );

  const formatTime = (seconds) => {
    if (!seconds) return "0 sec";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes === 0) {
      return `${remainingSeconds} sec`;
    }

    return `${minutes} min ${remainingSeconds} sec`;
  };

  const filteredTests = sortedTests.filter((test) => {

    const matchQuizType =
      !quizType || test.test_visibility === quizType;

    const matchStatus =
      !passingStatus ||
      (
        test.is_result_declared === "Yes" &&
        test.status === passingStatus
      );

    const matchSearch =
      test.test_name
        .toLowerCase()
        .includes(searchText.toLowerCase());

    return (
      matchQuizType &&
      matchStatus &&
      matchSearch
    );
  });

  const clearFilters = () => {
    setQuizType("");
    setPassingStatus("");
    setSearchText("");
    setCurrentPage(1);
  };

  const handleParticipationCertificateDownload = (test_id, test_name, submit_date) => {

    const certificateData = {
      test_id: test_id,
      test_name: test_name,
      student_name: user.name,
      standard: user.standard_type,
      institute_data: user.institute_id == null ? null : institute,
      test_date: submit_date
    };
    childRef.current.generateParticipationCertificate(certificateData);
  };


  const handleAchievementCertificateDownload = (test_id, test_name, submit_date) => {

    const certificateData = {
      test_ID: test_id,
      test_name: test_name,
      user_ID: user_id,
      test_date: submit_date
    };
    childRef.current.generateAchievementCertificate(certificateData);
  };

  const handleReportDownload = (test_id, test_name, submit_date) => {

    const ReportData = {
      test_ID: test_id,
      test_name: test_name,
      user_ID: user_id,
      test_date: submit_date
    };
    childRef.current.generateReport(ReportData);
  };

  const isResultAvailable = (releaseDate) => {
    if (!releaseDate) return false;
    return new Date(releaseDate) <= new Date();
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

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen]);

  const totalPages = Math.ceil(filteredTests.length / itemsPerPage);

  const currentTests = filteredTests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="pastTest">
      {/*****Filter section */}
      <div className="Sticky-filterby">
        <div className={`filter-section ${isFilterOpen ? 'filter-section--open' : ''}`} ref={filterRef}>
          <h2>Filter By</h2>
          <hr />
          <div className="filter-group">
            <label>Quiz Type</label>
            <select
              value={quizType}
              onChange={(e) => {
                setQuizType(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Quizzes</option>

              {user?.institute_id &&
                <option value="Institution">Institutional</option>
              }

              <option value="Global">General</option>
              <option value="Interest">Interest Based</option>
            </select>
          </div>
          <hr />
          {/* <div className="filter-group">
            <label>Date</label>
            <select>
              <option value="yesterday">Yesterday</option>
              <option value="last-7-days">Last 7 Days</option>
              <option value="last-30-days">Last 30 Days</option>
              <option value="last-year">Last Year </option>
            </select>
          </div>
          <hr /> */}
          <div className="filter-group">
            <label>Passing Status </label>
            <select
              value={passingStatus}
              onChange={(e) => {
                setPassingStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All</option>
              <option value="Pass">Pass</option>
              <option value="Fail">Fail</option>
            </select>
          </div>
          <hr />
          <div className="filter-group">
            <label>Search By:</label>
            <input
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Enter Quiz Name"
            />
            <hr />
          </div>
          {/* <div className="filter-group">
            <label>Performance</label>

          </div>
          <hr />
          <div className="filter-group">
            <label>Self Practice Quiz</label>
          </div> */}
          {/* <br></br> */}
          {/* <br></br><br></br> */}

          <div
            className="clear-filters"
            onClick={clearFilters}
          >
            Clear Search & Filter
          </div>
        </div>
      </div>
      {/***main section starts */}
      <div className="pastTest-main-section">
        {/***header ***** */}
        <div className="pastTest-header">
          <h1>Past Quizzes</h1>
          <div className="filter-toggle-wrapper">
            <button className="filter-toggle-button" onClick={toggleFilter} ref={buttonRef}>
              {isFilterOpen ? 'Hide Filters' : 'Filter By'}
            </button>
          </div>
        </div>
        {
          /***Table container****/
        }
        <div className='table-container'>

          <table>
            <thead>
              <tr>
                <th>S.No.</th>
                <th>Test Name</th>
                {/* <th>Test Marks</th> */}
                <th>Time Taken</th>
                <th>Submit Date</th>
                <th>Download Certificate</th>
                <th>Download Report</th>
                <th>Result</th>
              </tr>

            </thead>
            <tbody>
              {currentTests.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>No Quizzes found.</td>
                </tr>
              ) : (
                currentTests.map((test, index) => (
                  <tr key={index}>
                    <td>
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td>{test.test_name}</td>
                    {/* <td>{test.marks}</td> */}
                    <td>{formatTime(test.time_taken)}</td>
                    <td>{test.test_date}</td>
                    <td>
                      <img src={'/images/download_certificate.png'} alt="Certificate"
                        className="certi-rep"
                        onClick={() => handleParticipationCertificateDownload(test.test_id, test.test_name, test.test_date)} />
                    </td>
                    <td>
                      <img
                        src="/images/download_report.png"
                        alt="Report"
                        title={
                          !isResultAvailable(test.result_release_date)
                            ? `Report will be available after ${test.result_release_date}`
                            : ""
                        }
                        className={`certi-rep ${!isResultAvailable(test.result_release_date) ? "disabled" : ""}`}
                        onClick={() => {
                          if (isResultAvailable(test.result_release_date)) {
                            handleReportDownload(
                              test.test_id,
                              test.test_name,
                              test.test_date
                            );
                          }
                        }}
                        style={{
                          opacity: isResultAvailable(test.result_release_date) ? 1 : 0.4,
                          cursor: isResultAvailable(test.result_release_date)
                            ? "pointer"
                            : "not-allowed",
                        }}
                      />
                    </td>
                    <td>
                      {isResultAvailable(test.result_release_date) ? (
                        <Link to={`/quiz-result/${test.test_id}`}>
                          <img
                            src="/images/result.png"
                            alt="Result"
                            className="certi-rep"
                            style={{
                              cursor: "pointer"
                            }}
                          />
                        </Link>
                      ) : (
                        <img
                          src="/images/result.png"
                          alt="Result unavailable"
                          className="certi-rep disabled"
                          title={`Result will be available after ${test.result_release_date}`}
                          style={{
                            opacity: 0.4,
                            cursor: "not-allowed"
                          }}
                        />
                      )}
                    </td>

                  </tr>
                )))}
            </tbody>

          </table>
          {totalPages > 1 && (
            <div className="pagination">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  className={currentPage === index + 1 ? "active" : ""}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <CertificateReport ref={childRef} />

    </div>

  )
}
export default PastTest;
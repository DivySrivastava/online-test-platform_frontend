import React, { useState, useEffect, useContext, useRef } from "react";
import "./css/PastTest.css";
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

  // NEW: detect mobile/touch screen
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // NEW: track which tooltip is currently open (mobile only)
  const [activeTooltip, setActiveTooltip] = useState(null);
  const tooltipContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutsideTooltip = (event) => {
      if (activeTooltip) {
        // agar click kisi bhi .tooltip-wrapper ke andar nahi hua, to close kar do
        const clickedInsideTooltip = event.target.closest(".tooltip-wrapper");
        if (!clickedInsideTooltip) {
          setActiveTooltip(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutsideTooltip);
    document.addEventListener("touchstart", handleClickOutsideTooltip);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideTooltip);
      document.removeEventListener("touchstart", handleClickOutsideTooltip);
    };
  }, [activeTooltip]);

  const toggleTooltip = (key) => {
    setActiveTooltip((prev) => (prev === key ? null : key));
  };

  useEffect(() => {
    axios
      .get(`${API_URL}/test/pasttests/${user_id}`)
      .then((response) => {
        setTests(response.data || []);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [user_id]);

  useEffect(() => {
    axios
      .get(`${API_URL}/institute/institutions/${user.institute_id}`)
      .then((response) => {
        setInstitute(response.data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [user.institute_id]);

  const sortedTests = [...tests].sort(
    (a, b) => new Date(b.test_date) - new Date(a.test_date),
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
    const matchQuizType = !quizType || test.test_visibility === quizType;
    const matchStatus =
      !passingStatus ||
      (test.is_result_declared === "Yes" && test.status === passingStatus);
    const matchSearch = test.test_name
      .toLowerCase()
      .includes(searchText.toLowerCase());
    return matchQuizType && matchStatus && matchSearch;
  });

  const clearFilters = () => {
    setQuizType("");
    setPassingStatus("");
    setSearchText("");
    setCurrentPage(1);
  };

  const handleParticipationCertificateDownload = (
    test_id,
    test_name,
    submit_date,
  ) => {
    const certificateData = {
      test_id: test_id,
      test_name: test_name,
      student_name: user.name,
      standard: user.standard_type,
      institute_data: user.institute_id == null ? null : institute,
      test_date: submit_date,
    };
    childRef.current.generateParticipationCertificate(certificateData);
  };

  const handleAchievementCertificateDownload = (
    test_id,
    test_name,
    submit_date,
  ) => {
    const certificateData = {
      test_ID: test_id,
      test_name: test_name,
      user_ID: user_id,
      test_date: submit_date,
    };
    childRef.current.generateAchievementCertificate(certificateData);
  };

  const handleReportDownload = (test_id, test_name, submit_date) => {
    const ReportData = {
      test_ID: test_id,
      test_name: test_name,
      user_ID: user_id,
      test_date: submit_date,
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterOpen]);

  const totalPages = Math.ceil(filteredTests.length / itemsPerPage);

  const currentTests = filteredTests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="pastTest">
      {isFilterOpen && (
        <div className="filter-backdrop" onClick={toggleFilter}></div>
      )}

      <div className="Sticky-filterby">
        <div
          className={`filter-section ${isFilterOpen ? "filter-section--open" : ""}`}
          ref={filterRef}
        >
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
              {user?.institute_id && (
                <option value="Institution">Institutional</option>
              )}
              <option value="Global">General</option>
              <option value="Interest">Interest Based</option>
            </select>
          </div>
          <hr />
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
          <div className="clear-filters" onClick={clearFilters}>
            Clear Search & Filter
          </div>
        </div>
      </div>

      <div className="pastTest-main-section">
        <div className="pastTest-header">
          <h1>Past Quizzes</h1>
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

        <div className="table-container" ref={tooltipContainerRef}>
          <table>
            <thead>
              <tr>
                <th>S.No.</th>
                <th>Test Name</th>
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
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    No Quizzes found.
                  </td>
                </tr>
              ) : (
                currentTests.map((test, index) => {
                  const reportKey = `report-${index}`;
                  const resultKey = `result-${index}`;
                  const reportAvailable = isResultAvailable(
                    test.result_release_date,
                  );

                  return (
                    <tr key={index}>
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>{test.test_name}</td>
                      <td>{formatTime(test.time_taken)}</td>
                      <td>{test.test_date}</td>
                      <td>
                        <img
                          src={"/images/download_certificate.png"}
                          alt="Certificate"
                          className="certi-rep"
                          onClick={() =>
                            handleParticipationCertificateDownload(
                              test.test_id,
                              test.test_name,
                              test.test_date,
                            )
                          }
                        />
                      </td>

                      {/* DOWNLOAD REPORT */}
                      <td>
                        <div className="tooltip-wrapper">
                          <img
                            src="/images/download_report.png"
                            alt="Report"
                            title={
                              !isMobile && !reportAvailable
                                ? `Report will be available after ${test.result_release_date}`
                                : ""
                            }
                            className={`certi-rep ${!reportAvailable ? "disabled" : ""}`}
                            onClick={() => {
                              if (reportAvailable) {
                                handleReportDownload(
                                  test.test_id,
                                  test.test_name,
                                  test.test_date,
                                );
                              } else if (isMobile) {
                                toggleTooltip(reportKey);
                              }
                            }}
                            style={{
                              opacity: reportAvailable ? 1 : 0.4,
                              cursor: reportAvailable
                                ? "pointer"
                                : "not-allowed",
                            }}
                          />
                          {isMobile &&
                            !reportAvailable &&
                            activeTooltip === reportKey && (
                              <span className="custom-tooltip">
                                Report will be available after{" "}
                                {test.result_release_date}
                              </span>
                            )}
                        </div>
                      </td>

                      {/* RESULT */}
                      <td>
                        {reportAvailable ? (
                          <Link to={`/quiz-result/${test.test_id}`}>
                            <img
                              src="/images/result.png"
                              alt="Result"
                              className="certi-rep"
                              style={{ cursor: "pointer" }}
                            />
                          </Link>
                        ) : (
                          <div className="tooltip-wrapper">
                            <img
                              src="/images/result.png"
                              alt="Result unavailable"
                              title={
                                !isMobile
                                  ? `Result will be available after ${test.result_release_date}`
                                  : ""
                              }
                              className="certi-rep disabled"
                              onClick={() => {
                                if (isMobile) toggleTooltip(resultKey);
                              }}
                              style={{
                                opacity: 0.4,
                                cursor: "not-allowed",
                              }}
                            />
                            {isMobile && activeTooltip === resultKey && (
                              <span className="custom-tooltip">
                                Result will be available after{" "}
                                {test.result_release_date}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
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
  );
};
export default PastTest;

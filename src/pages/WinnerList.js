import React, { useState, useEffect, useRef, useContext } from "react";
import "./css/WinnerList.css";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import CertificateReport from "../CertificateReport";
import axios from "axios";

const QUIZ_TYPES = ["General", "Academic", "Competitive", "Mock"];
const QUIZ_VISIBILITY = ["Institute", "Global", "Interest Based"];
const QUIZ_LANGUAGE = ["English", "Hindi", "Both English and Hindi"];

const WinnerSection = () => {
  const navigate = useNavigate();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);
  const buttonRef = useRef(null);
  const childRef = useRef();

  const API_URL = process.env.REACT_APP_API_URL;
  const [tests, setTests] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedTest, setExpandedTest] = useState(null);
  const [filters, setFilters] = useState({
    test_type: "",
    test_visibility: "",
    test_lang: "",
    search_type: "name",
    search: "",
  });
  const { user } = useContext(UserContext);

  const languageMap = {
    english: "English",
    hindi: "Hindi",
    both: "English and Hindi",
  };

  const handleAchievementCertificateDownload = (
    student_id,
    test_id,
    test_name,
    submit_date,
  ) => {
    const certificateData = {
      test_ID: test_id,
      test_name: test_name,
      user_ID: student_id,
      test_date: submit_date,
    };
    childRef.current.generateAchievementCertificate(certificateData);
  };

  useEffect(() => {
    if (user) {
      fetchWinnerList();
    }
  }, [user, page, filters]);

  const fetchWinnerList = async () => {
    try {
      const params = {
        page,
        ...filters,
      };

      // If logged-in user is Teacher (role_id = 3)
      if (user?.role_id === 3) {
        params.institute_id = user.institute_id;
      }

      const response = await axios.get(`${API_URL}/test/winner-list`, {
        params,
      });

      setTests(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePrevious = () => {
    if (page > 1) {
      setPage(page - 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      setPage(page + 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const handleSearch = () => {
    setPage(1);

    fetchWinnerList();
  };

  const clearFilters = () => {
    setPage(1);

    setFilters({
      test_type: "",
      test_visibility: "",
      test_lang: "",
      search_type: "name",
      search: "",
    });
  };

  const toggleFilter = () => setIsFilterOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isFilterOpen &&
        filterRef.current &&
        !filterRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsFilterOpen(false);
      }
    };
    //document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFilterOpen]);

  useEffect(() => {
    document.body.style.overflow = expandedTest ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [expandedTest]);

  return (
    <div className="winner-section">
      {/* ── Sidebar (desktop) / dropdown (mobile) ── */}
      {/*<div
                className={`filter-section-ws ${isFilterOpen ? "filter-section--open-ws" : ""}`}
                ref={filterRef}
            >
                <h2>Filter By</h2>
                <hr />
                <div className="filter-group-ws">
                    <label>State</label>
                    <select>
                        <option value="">All States</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                        <option value="approved">Approved</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="live">Live</option>
                        <option value="expired">Expired</option>
                        <option value="deleted">Deleted</option>
                    </select>
                </div>
                <hr />
                <div className="filter-group-ws">
                    <label>Visibility</label>
                    <select>
                        <option value="">All</option>
                        <option value="institution-based">Institution Based</option>
                        <option value="global">Global</option>
                        <option value="interest-based">Interest Based</option>
                    </select>
                </div>
                <hr />
                <div className="filter-group-ws">
                    <label>Language</label>
                    <select>
                        <option value="">All Languages</option>
                        <option value="english">English</option>
                        <option value="hindi">Hindi</option>
                    </select>
                </div>
                <hr />
                <div className="filter-group-ws">
                    <label>Categories</label>
                    <select>
                        <option value="">All Categories</option>
                        <option value="general">General</option>
                        <option value="academic">Academic</option>
                        <option value="competitive">Competitive</option>
                        <option value="mock">Mock</option>
                    </select>
                </div>
                <hr />
                <div className="filter-group-ws">
                    <label>Pricing</label>
                    <select>
                        <option value="">All</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                    </select>
                </div>
            </div>*/}

      {/* NEW — overlay */}
      {isFilterOpen && (
        <div
          className="filter-overlay"
          onClick={() => setIsFilterOpen(false)}
        />
      )}

      <aside
        className={`su-filter${isFilterOpen ? " su-filter--open" : ""}`}
        ref={filterRef}
      >
        <h2 className="su-filter-title">Filter By:</h2>

        <div className="su-filter-group">
          <label>Quiz Type</label>
          <select
            value={filters.test_type}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                test_type: e.target.value,
              }))
            }
          >
            <option value="">All</option>
            {QUIZ_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="su-filter-group">
          <label>Quiz Visibility</label>
          <select
            value={filters.test_visibility}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                test_visibility: e.target.value,
              }))
            }
          >
            <option value="">All</option>
            {QUIZ_VISIBILITY.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="su-filter-group">
          <label>Quiz Language</label>
          <select
            value={filters.test_lang}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                test_lang: e.target.value,
              }))
            }
          >
            <option value="">All</option>
            {QUIZ_LANGUAGE.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="su-filter-group">
          <label>
            {/* {filters.search_type === "name" ? "Quiz Name" : "Quiz ID"} */}
            Search
          </label>

          <input
            value={filters.search}
            onChange={(e) => {
              const value = e.target.value;

              if (filters.search === "id") {
                if (/^\d*$/.test(value)) {
                  setFilters((prev) => ({
                    ...prev,
                    search: value,
                  }));
                }
              } else {
                setFilters((prev) => ({
                  ...prev,
                  search: value,
                }));
              }
            }}
            placeholder={
              // filters.search_type === "name"
              //     ? "Enter quiz name..."
              //     : "Enter quiz ID..."
              "Enter Quiz ID or Name"
            }
          />
        </div>

        {/* <button className="su-apply-btn" onClick={handleSearch}>
                    Search
                </button> */}

        <div className="su-clear-filter" onClick={clearFilters}>
          Clear Search & Filter
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="winner-main-section">
        <fieldset className="winner-fieldset">
          <legend>
            <h1>WINNERS</h1>
          </legend>

          {/*
                        Toggle button — MUST stay inside .filter-toggle-wrapper-ws
                        which is position:relative so the sidebar dropdown anchors
                        directly below this button on mobile.
                    */}
          <div className="filter-toggle-wrapper-ws">
            <button
              className="filter-toggle-button-ws"
              onClick={toggleFilter}
              ref={buttonRef}
            >
              {isFilterOpen ? "Hide Filters" : "Filter By"}
            </button>
          </div>

          <div className="winner-table-scroll">
            <div className="winner-table-cards">
              <div className="winner-header">
                <span className="winner-header-spacer" aria-hidden="true" />

                <div className="winner-header-data">
                  <span className="col-position">Position</span>
                  <span className="col-userid">User ID</span>
                  <span className="col-name">Name</span>
                  <span className="col-marks">Marks</span>
                  <span className="col-time">Time Taken</span>
                  <span className="col-achievement">Achievement</span>
                </div>
              </div>

              <div className="winner-container">
                {tests && tests.length > 0 ? (
                  tests.map((test, index) => (
                    <div className="winner-card" key={index}>
                      <div className="test-info modern-card">
                        <div className="card-icon-row">
                          <div className="card-icon">
                            <span>
                              {test.test_name?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                          <h2>{test.test_name}</h2>
                        </div>

                        <div className="card-grid">
                          <div className="grid-item">
                            <span className="grid-label">Quiz ID</span>
                            <span className="grid-value">{test.test_id}</span>
                          </div>
                          <div className="grid-item">
                            <span className="grid-label">Category</span>
                            <span className="grid-value">{test.test_type}</span>
                          </div>
                        </div>

                        <div className="winners-badge">
                          🏆{" "}
                          {test.winners && test.winners.length > 0
                            ? `${test.winners.length} winner${test.winners.length > 1 ? "s" : ""}`
                            : "No winners yet"}
                        </div>

                        {test.winners && test.winners.length > 0 && (
                          <div className="top-winner-mobile">
                            🥇{" "}
                            <span className="top-winner-name">
                              {test.winners[0].student_name}
                            </span>
                          </div>
                        )}

                        <div className="test-info-extra">
                          <p>Visibility: {test.test_visibility}</p>
                          <p>
                            Language:{" "}
                            {languageMap[test.test_lang] || test.test_lang}
                          </p>
                          <p>Duration: {test.test_duration} mins</p>
                          <p>
                            Released:{" "}
                            {new Date(
                              test.result_release_date,
                            ).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        </div>

                        <button
                          type="button"
                          className="show-more-btn"
                          onClick={() => setExpandedTest(test)}
                        >
                          Show more
                          <svg
                            className="show-more-icon"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M6 9l6 6 6-6"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="students-list">
                        {test.winners && test.winners.length > 0 ? (
                          test.winners.map((student, i) => (
                            <div className="student-row" key={i}>
                              <span>{student.student_rank}</span>
                              <span>{student.student_id}</span>
                              <span>{student.student_name}</span>

                              <span className="col-marks">
                                {student.marks}/{student.max_marks}
                              </span>

                              <span className="col-time">
                                {Math.floor(student.time_taken / 60)} mins{" "}
                                {student.time_taken % 60} secs
                              </span>

                              <img
                                src="/images/download.png"
                                alt="Certificate"
                                className="certi-rep"
                                onClick={() =>
                                  handleAchievementCertificateDownload(
                                    student.student_id,
                                    test.test_id,
                                    test.test_name,
                                    student.test_date,
                                  )
                                }
                              />
                            </div>
                          ))
                        ) : (
                          <div className="no-winners">No winners</div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-winners">
                    <h4>No Winners Found</h4>
                  </div>
                )}
              </div>

              {/* PAGINATION - TABLE KE SAATH */}
              <div className="su-pagination">
                <button
                  className="su-page-btn"
                  onClick={(e) => {
                    handlePrevious();
                    e.currentTarget.blur();
                  }}
                  disabled={page === 1}
                >
                  &#9664;
                </button>

                <span className="su-page-info">
                  {page === 0 ? "No Pages" : `Page ${page} of ${totalPages}`}
                </span>

                <button
                  className="su-page-btn"
                  onClick={(e) => {
                    handleNext();
                    e.currentTarget.blur();
                  }}
                  disabled={page === totalPages || totalPages === 0}
                >
                  &#9654;
                </button>
              </div>
            </div>
          </div>
        </fieldset>

        <CertificateReport ref={childRef} />
      </div>

      {expandedTest && (
        <div
          className="test-modal-overlay"
          onClick={() => setExpandedTest(null)}
        >
          <div
            className="test-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="test-modal-header">
              <div className="modal-title-row">
                <div className="card-icon small">
                  <span>
                    {expandedTest.test_name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <h2>{expandedTest.test_name}</h2>
              </div>
              <button
                type="button"
                className="test-modal-close"
                onClick={() => setExpandedTest(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-info-grid">
              <div className="modal-info-item">
                <span className="modal-info-label">Quiz ID</span>
                <span className="modal-info-value">{expandedTest.test_id}</span>
              </div>
              <div className="modal-info-item">
                <span className="modal-info-label">Category</span>
                <span className="modal-info-value">
                  {expandedTest.test_type}
                </span>
              </div>
              <div className="modal-info-item">
                <span className="modal-info-label">Visibility</span>
                <span className="modal-info-value">
                  {expandedTest.test_visibility}
                </span>
              </div>
              <div className="modal-info-item">
                <span className="modal-info-label">Language</span>
                <span className="modal-info-value">
                  {languageMap[expandedTest.test_lang] ||
                    expandedTest.test_lang}
                </span>
              </div>
              <div className="modal-info-item">
                <span className="modal-info-label">Duration</span>
                <span className="modal-info-value">
                  {expandedTest.test_duration} mins
                </span>
              </div>
              <div className="modal-info-item">
                <span className="modal-info-label">Released</span>
                <span className="modal-info-value">
                  {new Date(
                    expandedTest.result_release_date,
                  ).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="test-modal-winners">
              <h3>Winners</h3>
              <div className="test-modal-winners-scroll">
                <div className="modal-winners-inner">
                  {/* NEW — header row, desktop jaisa */}
                  <div className="modal-winner-header-row">
                    <span>Position</span>
                    <span>User ID</span>
                    <span>Name</span>
                    <span>Marks</span>
                    <span>Time Taken</span>
                    <span>Achievement</span>
                  </div>

                  {expandedTest.winners && expandedTest.winners.length > 0 ? (
                    expandedTest.winners.map((student, i) => (
                      <div className="student-row-modal" key={i}>
                        <span>{student.student_rank}</span>
                        <span>{student.student_id}</span>
                        <span>{student.student_name}</span>
                        <span>
                          {student.marks}/{student.max_marks}
                        </span>
                        <span>
                          {Math.floor(student.time_taken / 60)}m{" "}
                          {student.time_taken % 60}s
                        </span>
                        <img
                          src="/images/download.png"
                          alt="Certificate"
                          className="certi-rep"
                          onClick={() =>
                            handleAchievementCertificateDownload(
                              student.student_id,
                              expandedTest.test_id,
                              expandedTest.test_name,
                              student.test_date,
                            )
                          }
                        />
                      </div>
                    ))
                  ) : (
                    <div className="no-winners">No winners</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WinnerSection;

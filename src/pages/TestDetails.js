import React, { useState, useEffect, useRef, useContext } from "react";
import "./css/TestDetails.css";
import { useAxios } from "../api/axiosInstance";
import { useNavigate } from "react-router-dom"; // ✅ Add this
import { UserContext } from "../contexts/UserContext";

const TestDetails = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);
  const buttonRef = useRef(null);
  const { user } = useContext(UserContext);
  const [tests, setTests] = useState([]);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  const limit = 6;
  const [filteredTests, setFilteredTests] = useState([]);
  const navigate = useNavigate(); // ✅ For redirection
  const API_URL = process.env.REACT_APP_API_URL;
  const axios = useAxios();

  const [filters, setFilters] = useState({
    state: "",
    visibility: "",
    language: "",
    category: "",
    pricing: "",
    search: "",
  });

  const handleDetails = (test_id) => {
    // console.log("Test_id" + test_id);
    navigate(`/dashboard/managequiz/quiz-detail/${test_id}`);
  };

  const fetchTest = async (page = 1) => {
    try {
      const res = await axios.get(`${API_URL}/test/tests`, {
        params: {
          page,
          limit,
          search: debouncedSearch,
          state: filters.state,
          visibility: filters.visibility,
          language: filters.language,
          category: filters.category,
          pricing: filters.pricing,
          role_id: user?.role_id,
          institute_id: user?.institute_id,
        },
      });

      console.log(res.data);

      // Sort current page's records by test_id (newest first)
      const sortedTests = [...res.data.data].sort(
        (a, b) => b.test_id - a.test_id,
      );

      setTests(sortedTests);
      setHasNext(res.data.hasNext);
      setHasPrevious(res.data.hasPrevious);

      setTotalPages(res.data.totalPages);
      setTotalRecords(res.data.totalRecords);

      setCurrentPage(res.data.currentPage);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (test_id) => {
    if (!window.confirm("Are you sure you want to delete this test?")) return;

    try {
      await axios.delete(`${API_URL}/test/delete-test/${test_id}`);

      alert("Test deleted successfully");
      fetchTest(); // Refresh list after deletion
    } catch (err) {
      console.error("Error deleting test:", err);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchTest(1);
  }, [
    filters.state,
    filters.visibility,
    filters.language,
    filters.category,
    filters.pricing,
    debouncedSearch,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [filters.search]);

  const handleNext = () => {
    if (!hasNext) return;

    fetchTest(currentPage + 1);
  };

  const handlePrevious = () => {
    if (!hasPrevious) return;

    fetchTest(currentPage - 1);
  };

  // Handle filter change
  const handleStatusChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Toggle filter section (mobile)
  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  // Close filter on outside click
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

  return (
    <div className="test-details-page">
      {/* Filter Sidebar */}
      <div className="Sticky-filterby">
        <div
          className={`filter-section-Details ${isFilterOpen ? "filter-section-Details--open" : ""}`}
          ref={filterRef}
        >
          <h2>Filter By</h2>
          <hr />

          <div className="filter-group">
            <label>Quiz State</label>
            <select
              name="state"
              value={filters.state}
              onChange={handleStatusChange}
            >
              <option value="">All</option>
              <option value="Active">Coming Soon</option>
              <option value="Live">Live</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          <hr />

          {user?.role_id != 3 && (
            <>
              <div className="filter-group">
                <label>Quiz Visibility</label>
                <select
                  name="visibility"
                  value={filters.visibility}
                  onChange={handleStatusChange}
                >
                  <option value="">All</option>
                  <option value="Institution">Institution Based</option>
                  <option value="Global">Global</option>
                  <option value="Interest">Interest Based</option>
                </select>
              </div>

              <hr />
            </>
          )}

          <div className="filter-group">
            <label>Quiz Language</label>
            <select
              name="language"
              value={filters.language}
              onChange={handleStatusChange}
            >
              <option value="">All Languages</option>
              <option value="english">English</option>
              <option value="hindi">Hindi</option>
              <option value="both">Both</option>
            </select>
          </div>

          <hr />

          {user?.role_id != 3 && (
            <>
              <div className="filter-group">
                <label>Quiz Pricing</label>
                <select
                  name="pricing"
                  value={filters.pricing}
                  onChange={handleStatusChange}
                >
                  <option value="">All</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              <hr />
            </>
          )}

          <div className="filter-group">
            <label>Search Quiz</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  search: e.target.value,
                }))
              }
              placeholder="Enter Quiz ID or Name"
            />
          </div>

          <button
            className="clear-filters-btn"
            onClick={() =>
              setFilters({
                state: "",
                visibility: "",
                language: "",
                category: "",
                pricing: "",
                search: "",
              })
            }
          >
            <span className="clear-filter-icon">↻</span>
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* Test Display Section */}
      <div className="test-details-section">
        <div className="test-details-header">
          <h1>Quizzes</h1>
          <div className="filter-toggle-wrapper">
            <button
              className="filter-toggle-td-button"
              onClick={toggleFilter}
              ref={buttonRef}
            >
              {isFilterOpen ? "Hide Filters" : "Filter By"}
            </button>
          </div>
        </div>

        <div className="test-container-row">
          {tests.map((test) => (
            <div key={test.id} className="test-card">
              <h3>{test.test_name}</h3>
              <p>
                <strong>Quiz ID:</strong> {test.test_id}
              </p>
              <p>
                <strong>Visibility:</strong> {test.test_visibility}
              </p>
              <p>
                <strong>Language:</strong> {test.test_lang}
              </p>
              <p>
                <strong>Category:</strong> {test.test_type}
              </p>
              {test.test_fees !== null && test.test_fees !== undefined && (
                <p>
                  <strong>Pricing:</strong> {test.test_fees}
                </p>
              )}

              <div className="btn-details">
                <button
                  className="details-button"
                  onClick={() => handleDetails(test.test_id)}
                >
                  Details
                </button>

                <button
                  className="details-button"
                  onClick={() => handleDelete(test.test_id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="pagination">
          <button
            className="page-btn"
            disabled={!hasPrevious}
            onClick={handlePrevious}
          >
            ❮
          </button>

          <span className="page-info">
            Page {currentPage} of {totalPages}
            <br />
            <small>
              {totalRecords} Quiz{totalRecords !== 1 ? "zes" : ""}
            </small>
          </span>

          <button className="page-btn" disabled={!hasNext} onClick={handleNext}>
            ❯
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestDetails;

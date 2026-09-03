import React, { useState, useEffect, useContext, useRef } from 'react';
import './css/PastTest.css';
import { UserContext } from "../contexts/UserContext";
import CertificateReport from "../CertificateReport";
import { useAxios } from "../api/axiosInstance";

const Acheivement = () => {

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);
  const buttonRef = useRef(null);
  // const [tests, setTests] = useState([]);
  const [institute, setInstitute] = useState([]);
  const { user } = useContext(UserContext);
  const childRef = useRef();
  const user_id = user.id;
  const API_URL = process.env.REACT_APP_API_URL;
  const axios = useAxios();
  const [quizType, setQuizType] = useState("");
  const [rankStatus, setRankStatus] = useState("");
  const [searchText, setSearchText] = useState("");
  const [achievements, setAchievements] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!user?.id) return;

    const fetchAchievements = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/test/achievements/${user.id}`
        );

        setAchievements(response.data);

        console.log("Achievements", response.data);

      } catch (error) {
        console.error("Error fetching achievements:", error);
      }
    };

    fetchAchievements();
  }, [user?.id, API_URL]);


  const sortedTests = [...achievements].sort(
    (a, b) => new Date(b.test_date) - new Date(a.test_date)
  );

  const filteredTests = sortedTests.filter((achievement) => {

    const matchQuizType =
      !quizType || achievement.test_visibility === quizType;

    const matchRankStatus =
      !rankStatus ||
      achievement.student_rank === Number(rankStatus);

    const matchSearch =
      achievement.test_name
        .toLowerCase()
        .includes(searchText.toLowerCase());

    return (
      matchQuizType &&
      matchRankStatus &&
      matchSearch
    );
  });

  const clearFilters = () => {
    setQuizType("");
    setRankStatus("");
    setSearchText("");
    setCurrentPage(1);
  };



  const handleAcheivementCertificateDownload = (
    test_Id,
    test_name,
    submit_date
  ) => {

    if (!user?.id) return;

    const certificateData = {
      test_ID: test_Id,
      test_name: test_name,
      user_ID: user?.id,
      test_date: submit_date
    };


    childRef.current.generateAchievementCertificate(certificateData);
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
            <label>Rank</label>
            <select
              value={rankStatus}
              onChange={(e) => {
                setRankStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
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
          <h1>Achievements</h1>
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
                <th>Quiz Name</th>
                <th>Score</th>
                <th>Rank</th>
                <th>Submission Date</th>
                <th>Download Acheivement Certificate</th>
              </tr>

            </thead>
            <tbody>
              {currentTests.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    No Achievement found.
                  </td>
                </tr>
              ) : (
                currentTests.map((achievement, index) => (
                  <tr key={achievement.test_id}>
                    <td>
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>

                    <td>{achievement.test_name}</td>

                    <td>
                      {achievement.marks}/{achievement.max_marks}
                    </td>

                    <td>{achievement.student_rank}</td>

                    <td>{achievement.test_date}</td>

                    <td>
                      <img
                        src="/images/download.png"
                        alt="Certificate"
                        className="certi-rep"
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          handleAcheivementCertificateDownload(
                            achievement.test_id,
                            achievement.test_name,
                            achievement.test_date
                          )
                        }
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="pagination">

              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  className={currentPage === index + 1 ? "active" : ""}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </button>

            </div>
          )}
        </div>
      </div>
      <CertificateReport ref={childRef} />

    </div>

  )
}
export default Acheivement;

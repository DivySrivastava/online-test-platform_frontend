import React, { useState, useEffect, useContext, useRef } from "react";
import "./css/PastTest.css";
import { useParams } from "react-router-dom";
import CertificateReport from "../CertificateReport";
import { useAxios } from "../api/axiosInstance";

const Participants = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);
  const buttonRef = useRef(null);
  const [tests, setTests] = useState([]);
  const [sortBy, setSortBy] = useState("");
  //const [passingStatus, setPassingStatus] = useState("");
  //const [searchText, setSearchText] = useState("");

  //const [currentPage, setCurrentPage] = useState(1);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 10,
  });
  const [passingStatus, setPassingStatus] = useState("");
  const [searchText, setSearchText] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  //const [institute, setInstitute] = useState([]);

  const { test_id } = useParams();
  const axios = useAxios();
  const [studentTestDetails, setStudentTestDetails] = useState(null);
  const [institute, setInstitute] = useState([]);
  const childRef = useRef();
  const API_URL = process.env.REACT_APP_API_URL;

  const fetchTestAndCreator = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/user/participants/${test_id}`,
        {
          params: {
            page: currentPage,
            limit: 10,
            sortBy,
            status: passingStatus,
            search: searchText,
          },
        },
      );

      setStudentTestDetails(response.data.data);

      setPagination(
        response.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalRecords: 0,
          limit: 10,
        },
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const clearFilters = () => {
    setSortBy("");
    setPassingStatus("");
    setSearchText("");
    setCurrentPage(1);
  };

  const toggleFilter = () => {
    setIsFilterOpen((prev) => !prev);
  };

  useEffect(() => {
    fetchTestAndCreator();
  }, [test_id, currentPage, sortBy, passingStatus, searchText]);

  const handleParticipationCertificateDownload = (
    test_id,
    test_name,
    submit_date,
    name,
    standard_type,
    institute_id,
  ) => {
    axios
      .get(`${API_URL}/institute/institutions/${institute_id}`)
      .then((response) => {
        const instituteData = response.data || [];

        console.log("Fetched Institution:", instituteData);

        // Build certificate data WITH institute response
        const certificateData = {
          test_id,
          test_name,
          student_name: name,
          standard: standard_type,
          institute_data: instituteData, // use response, not state
          test_date: submit_date,
        };

        // Now generate certificate
        childRef.current.generateParticipationCertificate(certificateData);
      })
      .catch((error) => console.error("Error fetching Institute:", error));
  };

  return (
    <>
      <div className="pastTest">
        {/* Mobile Filter Background Blur */}
        {isFilterOpen && (
          <div
            className="filter-backdrop"
            onClick={() => setIsFilterOpen(false)}
          ></div>
        )}

        {/***** Filter section *****/}
        <div className="Sticky-filterby">
          <div
            className={`filter-section ${isFilterOpen ? "filter-section--open" : ""}`}
            ref={filterRef}
          >
            <h2>Actions</h2>
            <hr />

            <div className="filter-group">
              <label>Sort By</label>

              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Select</option>
                <option value="Rank">Rank</option>
              </select>
            </div>

            <hr />

            <div className="filter-group">
              <label>Passing Status</label>

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
                placeholder="Participant ID / Institute ID"
              />

              <hr />
            </div>

            <div className="clear-filters" onClick={clearFilters}>
              Clear Search & Filter
            </div>
          </div>
        </div>

        {/***** Main section *****/}
        <div className="pastTest-main-section">
          <div className="pastTest-header">
            <h1>Participants</h1>

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

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>S.No.</th>
                  <th>Rank</th>
                  <th>Participant ID</th>
                  <th>Institute ID</th>
                  <th>Participant Name</th>
                  <th>Score</th>
                  <th>Time Taken(Sec)</th>
                  <th>Passing Status</th>
                  <th>Submission Date</th>
                  <th>Download Certificate</th>
                </tr>
              </thead>

              <tbody>
                {studentTestDetails && studentTestDetails.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: "center" }}>
                      No participation found.
                    </td>
                  </tr>
                ) : (
                  studentTestDetails &&
                  studentTestDetails.map((studentTestDetail, index) => (
                    <tr key={studentTestDetail.student_id || index}>
                      <td>{(currentPage - 1) * 10 + index + 1}</td>

                      <td>{studentTestDetail.student_rank || "NA"}</td>

                      <td>{studentTestDetail.student_id}</td>

                      <td>{studentTestDetail.institute_id || "NA"}</td>

                      <td>{studentTestDetail.student_name}</td>

                      <td>{studentTestDetail.marks}</td>

                      <td>
                        {`${Math.floor(studentTestDetail.time_taken / 60)} min ${
                          studentTestDetail.time_taken % 60
                        } sec`}
                      </td>

                      <td>{studentTestDetail.status}</td>

                      <td>{studentTestDetail.submit_date_time}</td>

                      <td>
                        <img
                          src="/images/download.png"
                          alt="Certificate"
                          className="certi-rep"
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            handleParticipationCertificateDownload(
                              test_id,
                              studentTestDetail.test_name,
                              studentTestDetail.test_date,
                              studentTestDetail.student_name,
                              studentTestDetail.standard_type,
                              studentTestDetail.institute_id,
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="pagination">
              <button
                onClick={() => setCurrentPage((prev) => prev - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              <span>
                Page {pagination?.currentPage || 1} of{" "}
                {pagination?.totalPages || 1}
              </span>

              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={currentPage >= pagination.totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <CertificateReport ref={childRef} />
    </>
  );
};

export default Participants;

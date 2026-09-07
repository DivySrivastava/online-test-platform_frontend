import React, { useState, useEffect, useContext, useRef } from "react";
import "./css/PastTest.css";
import { useParams } from "react-router-dom";
import CertificateReport from "../CertificateReport";
import { useAxios } from "../api/axiosInstance";
import * as XLSX from "xlsx-js-style";
import { toast } from "react-toastify";

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



  const exportParticipantData = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/user/participants/${test_id}/export`,
        {
          params: {
            sortBy,
            status: passingStatus,
            search: searchText,
          },
        }
      );

      const participants = response.data.data;

      if (!participants || participants.length === 0) {
        toast.warning("No participant data available to export.");
        return;
      }

      // =========================
      // Test Name
      // =========================
      const testName = participants[0].test_name || "Test";

      const safeTestName = testName
        .replace(/[\\/:*?"<>|]/g, "_")
        .trim();

      // =========================
      // Column Headers
      // =========================
      const headers = [
        "Rank",
        "User ID",
        "Institute ID",
        "Participant Name",
        "Test Name",
        "Test Date",
        "Marks",
        "Passing Status",
        "Submission Date",
      ];

      // =========================
      // Participant Data
      // =========================
      const excelData = participants.map((participant) => [
        participant.student_rank ?? "--",
        participant.student_id ?? "--",
        participant.institute_id ?? "--",
        participant.student_name ?? "--",
        participant.test_name ?? "--",
        participant.test_date ?? "--",
        participant.marks ?? "--",
        participant.status ?? "--",
        participant.submit_date_time ?? "--",
      ]);

      // =========================
      // Create Worksheet
      // =========================
      const worksheet = XLSX.utils.aoa_to_sheet([
        [`${testName}_Sahash`],
        headers,
        ...excelData,
      ]);

      // =========================
      // Merge Row 1
      // =========================
      worksheet["!merges"] = [
        {
          s: { r: 0, c: 0 },
          e: { r: 0, c: headers.length - 1 },
        },
      ];

      // =========================
      // Row 1 - Test Name
      // Light Green + Bold
      // =========================
      worksheet["A1"].s = {
        fill: {
          patternType: "solid",
          fgColor: {
            rgb: "C6EFCE",
          },
        },
        font: {
          bold: true,
          sz: 14,
        },
        alignment: {
          horizontal: "center",
          vertical: "center",
        },
      };

      // =========================
      // Row 2 - Headers
      // Light Gray + Bold
      // =========================
      for (let col = 0; col < headers.length; col++) {
        const cellAddress = XLSX.utils.encode_cell({
          r: 1,
          c: col,
        });

        worksheet[cellAddress].s = {
          fill: {
            patternType: "solid",
            fgColor: {
              rgb: "D9D9D9",
            },
          },
          font: {
            bold: true,
            sz: 11,
          },
          alignment: {
            horizontal: "center",
            vertical: "center",
          },
          border: {
            top: {
              style: "thin",
              color: {
                rgb: "808080",
              },
            },
            bottom: {
              style: "thin",
              color: {
                rgb: "808080",
              },
            },
            left: {
              style: "thin",
              color: {
                rgb: "808080",
              },
            },
            right: {
              style: "thin",
              color: {
                rgb: "808080",
              },
            },
          },
        };
      }

      // =========================
      // Style Data Cells
      // =========================
      for (let row = 2; row < excelData.length + 2; row++) {
        for (let col = 0; col < headers.length; col++) {
          const cellAddress = XLSX.utils.encode_cell({
            r: row,
            c: col,
          });

          if (worksheet[cellAddress]) {
            worksheet[cellAddress].s = {
              alignment: {
                vertical: "center",
              },
            };
          }
        }
      }

      // =========================
      // Column Widths
      // =========================
      worksheet["!cols"] = [
        { wch: 8 },
        { wch: 12 },
        { wch: 14 },
        { wch: 25 },
        { wch: 25 },
        { wch: 15 },
        { wch: 10 },
        { wch: 16 },
        { wch: 22 },
      ];

      // =========================
      // Row Heights
      // =========================
      worksheet["!rows"] = [
        { hpt: 28 },
        { hpt: 24 },
      ];

      // =========================
      // Create Workbook
      // =========================
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Participants"
      );

      // =========================
      // Download
      // =========================
      XLSX.writeFile(
        workbook,
        `${safeTestName}_participants.xlsx`
      );

      toast.success("Participant data exported successfully.");

    } catch (error) {
      console.error("Error exporting participant data:", error);

      toast.error("Failed to export participant data.");
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

            <div className="filter-group">
              <label>Export Participant Data</label>
              <button
                type="button"
                onClick={exportParticipantData}
              >
                Export Excel Sheet
              </button>
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
                        {`${Math.floor(studentTestDetail.time_taken / 60)} min ${studentTestDetail.time_taken % 60
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

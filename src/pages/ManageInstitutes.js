// Institution.js — React (global CDN), no imports needed
import React from "react";
import "./css/ManageInstitutes.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
const { useState, useEffect, useRef } = React;

const ALL_DATA = [
  {
    id: 1,
    instId: "INST001",
    name: "SBSSU",
    city: "Rajasthan, Jaipur",
    reg: "Yes",
  },
  {
    id: 2,
    instId: "INST002",
    name: "Delhi Public School",
    city: "Delhi, New Delhi",
    reg: "Yes",
  },
  {
    id: 3,
    instId: "INST003",
    name: "IIT Bombay",
    city: "Maharashtra, Mumbai",
    reg: "Yes",
  },
  {
    id: 4,
    instId: "INST004",
    name: "St. Xavier College",
    city: "Gujarat, Ahmedabad",
    reg: "No",
  },
  {
    id: 5,
    instId: "INST005",
    name: "Amity University",
    city: "UP, Noida",
    reg: "Yes",
  },
  {
    id: 6,
    instId: "INST006",
    name: "Christ University",
    city: "Karnataka, Bengaluru",
    reg: "No",
  },
  {
    id: 7,
    instId: "INST007",
    name: "Presidency College",
    city: "West Bengal, Kolkata",
    reg: "Yes",
  },
  {
    id: 8,
    instId: "INST008",
    name: "Symbiosis Institute",
    city: "Maharashtra, Pune",
    reg: "Yes",
  },
  {
    id: 9,
    instId: "INST009",
    name: "Jadavpur University",
    city: "West Bengal, Kolkata",
    reg: "Yes",
  },
  {
    id: 10,
    instId: "INST010",
    name: "NIT Trichy",
    city: "Tamil Nadu, Trichy",
    reg: "Yes",
  },
  {
    id: 11,
    instId: "INST011",
    name: "BHU Varanasi",
    city: "UP, Varanasi",
    reg: "No",
  },
  {
    id: 12,
    instId: "INST012",
    name: "Miranda House",
    city: "Delhi, New Delhi",
    reg: "Yes",
  },
  {
    id: 13,
    instId: "INST013",
    name: "BITS Pilani",
    city: "Rajasthan, Pilani",
    reg: "Yes",
  },
  {
    id: 14,
    instId: "INST014",
    name: "Loyola College",
    city: "Tamil Nadu, Chennai",
    reg: "No",
  },
  {
    id: 15,
    instId: "INST015",
    name: "IIM Ahmedabad",
    city: "Gujarat, Ahmedabad",
    reg: "Yes",
  },
  {
    id: 16,
    instId: "INST016",
    name: "Fergusson College",
    city: "Maharashtra, Pune",
    reg: "Yes",
  },
  {
    id: 17,
    instId: "INST017",
    name: "St. Stephen's",
    city: "Delhi, New Delhi",
    reg: "Yes",
  },
  {
    id: 18,
    instId: "INST018",
    name: "Calcutta University",
    city: "West Bengal, Kolkata",
    reg: "No",
  },
  {
    id: 19,
    instId: "INST019",
    name: "VIT Vellore",
    city: "Tamil Nadu, Vellore",
    reg: "Yes",
  },
  {
    id: 20,
    instId: "INST020",
    name: "Anna University",
    city: "Tamil Nadu, Chennai",
    reg: "Yes",
  },
];

const PER_PAGE = 10;

function Manageinstitutes() {
  // nav
  const [navOpen, setNavOpen] = useState(false);
  const navigate = useNavigate();
  // filter sidebar — from PastTest.js pattern
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);
  const buttonRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL;

  // filter values
  const [stateVal, setStateVal] = useState("");
  const [cityVal, setCityVal] = useState("");
  const [regVal, setRegVal] = useState("");
  const [typeVal, setTypeVal] = useState("");
  const [searchType, setSearchType] = useState("name"); // default
  const [searchInput, setSearchInput] = useState("");
  const [instituteID, setInstituteId] = useState(null);
  const [searchVal, setSearchVal] = useState("");
  const [pagination, setPagination] = useState({});
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [districtsData, setDistrictsData] = useState([]);
  const [showStandardsModal, setShowStandardsModal] = useState(false);
  const [selectedInstituteStandards, setSelectedInstituteStandards] = useState(
    [],
  );
  const [selectedInstituteName, setSelectedInstituteName] = useState("");
  const [standardData, setStandardData] = useState(null);
  const [standardTitle, setStandardTitle] = useState(null);
  // table
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // same as backend default
  // const totalPages = Math.ceil(rows.length / PER_PAGE);
  // const totalPages = pagination.totalPages;
  // const start      = (page - 1) * PER_PAGE;
  // const pageRows   = rows.slice(start, start + PER_PAGE);
  // const pageLabel  = rows.length === 0 ? "0" : `${start + 1} - ${Math.max(start + PER_PAGE, totalPages)}`;

  //const start = (pagination.currentPage - 1) * pagination.limit + 1;
  //const { currentPage = 1, limit = 10, totalRecords = 0 } = pagination;
  const serialStart = (pagination.currentPage - 1) * pagination.limit;
  const { currentPage = 1, pageLimit = 10, totalRecords = 0 } = pagination;

  const labelStart = totalRecords ? (currentPage - 1) * pageLimit + 1 : 0;
  const labelEnd = totalRecords
    ? Math.min(currentPage * pageLimit, totalRecords)
    : 0;

  const pageLabel =
    totalRecords === 0 ? "0" : `${labelStart} - ${labelEnd} of ${totalRecords}`;
  // click outside — from PastTest.js
  const toggleFilter = () => setIsFilterOpen((prev) => !prev);

  const handleViewStandards = async (instituteId, instituteType) => {
    try {
      const response = await axios.get(
        `${API_URL}/institute/standards/${instituteId}`,
      );

      console.log("Standard", response.data);
      setStandardData(response.data);

      setStandardTitle(
        instituteType === "School"
          ? "Standards"
          : instituteType === "College"
            ? "Courses"
            : instituteType === "University"
              ? "Courses"
              : instituteType === "Coaching"
                ? "Exams"
                : "Standards",
      );

      //setSelectedInstituteStandards(response.data);
      //setSelectedInstituteName(instituteName);
      setShowStandardsModal(true);
    } catch (error) {
      console.error(error);
    }
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFilterOpen]);

  useEffect(() => {
    fetch("/district.json")
      .then((res) => res.json())
      .then((data) => {
        const uniqueStates = [...new Set(data.map((item) => item.state))];
        setStates(uniqueStates);
        setDistrictsData(data); // Save entire data if needed for filtering districts
      })
      .catch((err) => console.error("Error loading districts data:", err));
  }, []);

  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        const res = await axios.get(`${API_URL}/institute/institutions`, {
          params: {
            page,
            limit,
            state: stateVal || null,
            city: cityVal || null,
            institute_type: typeVal || null,
            registered: regVal === "" ? null : regVal,
            search: searchVal || null, // ✅ changed
            institute_id: instituteID || null,
          },
        });

        //console.log("Institute", res.data.data);

        setRows(res.data.data);
        setPagination(res.data.pagination);
      } catch (err) {
        console.error(err);
      }
    };

    fetchInstitutes();
  }, [page, stateVal, cityVal, typeVal, regVal, searchVal, instituteID]); // ✅ IMPORTANT

  const handleStateChange = (e) => {
    const selectedState = e.target.value;

    setStateVal(selectedState); // ✅ IMPORTANT
    setCityVal(""); // reset city when state changes
    setPage(1); // ✅ reset

    const filteredDistricts = districtsData
      .filter((item) => item.state === selectedState)
      .map((item) => item.district);

    const uniqueDistricts = [...new Set(filteredDistricts)];
    setDistricts(uniqueDistricts);
  };

  const handleDistrictChange = (e) => {
    const selectedDistrict = e.target.value;
    setCityVal(selectedDistrict); // ✅ IMPORTANT
    setPage(1); // ✅ reset
  };

  const handleApply = () => {
    let r = ALL_DATA;
    if (stateVal !== "All")
      r = r.filter((i) => i.city.split(",")[0].trim() === stateVal);
    if (cityVal !== "All")
      r = r.filter((i) => i.city.split(",")[1]?.trim() === cityVal);
    if (regVal !== "All") r = r.filter((i) => i.reg === regVal);
    setRows(r);
    setPage(1);
    setIsFilterOpen(false);
  };

  const handleSearch = () => {
    setPage(1);

    if (searchType === "name") {
      setSearchVal(searchInput); // for name search
      setInstituteId(null);
    } else {
      setInstituteId(searchInput); // for ID search
      setSearchVal(null);
    }
  };

  const handleClear = () => {
    setStateVal("");
    setCityVal("");
    setRegVal("");
    setTypeVal("");
    setSearchInput(""); // ✅ Clear search textbox
    setSearchType("name"); // optional: reset search type
    setSearchVal(""); // important
    setDistricts([]); // ✅ clear city dropdown
    setInstituteId(null); // clear ID filter
    setPage(1);
  };

  const handleAddInstitute = () => {
    navigate("/dashboard/manageinstitution/institutionregistration");
  };

  return (
    <div className="page-wrapper">
      {/* Filter overlay - dims/blurs background when filter panel is open (mobile) */}
      {isFilterOpen && (
        <div
          className="filter-overlay"
          onClick={() => setIsFilterOpen(false)}
        />
      )}

      {/* ══════════ BODY ══════════ */}
      <div className="body-layout">
        {/* ══════════ FILTER SIDEBAR ══════════ */}
        <aside
          className={`filter-sidebar ${isFilterOpen ? "filter-sidebar--open" : ""}`}
          ref={filterRef}
        >
          <h2>Filter By:</h2>
          <hr className="f-hr" />

          <div className="f-row">
            <label>State:</label>
            <select value={stateVal} onChange={handleStateChange}>
              <option value="" disabled hidden>
                Institution State
              </option>
              {states.map((state, idx) => (
                <option key={idx} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div className="f-row">
            <label>City:</label>
            <select value={cityVal} onChange={handleDistrictChange}>
              <option value="" disabled hidden>
                Institution District
              </option>
              {districts.map((dist, idx) => (
                <option key={idx} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>

          <div className="f-row">
            <label>Registered:</label>
            <select value={regVal} onChange={(e) => setRegVal(e.target.value)}>
              <option value="">All</option>
              <option value="1">Yes</option>
              <option value="0">No</option>
            </select>
          </div>

          <div className="f-row">
            <label>Institute type:</label>
            <select
              value={typeVal}
              onChange={(e) => setTypeVal(e.target.value)}
            >
              {["All", "School", "College", "University", "Coaching"].map(
                (o) => (
                  <option key={o}>{o}</option>
                ),
              )}
            </select>
          </div>

          {/* <button className="f-btn" onClick={handleApply}>Apply</button> */}

          <hr className="f-hr" />
          {/* <p className="f-sub">Search By:</p> */}
          <div className="f-row">
            <p className="f-sub">Search By:</p>
            <select
              value={searchType}
              onChange={(e) => {
                setSearchType(e.target.value);
                setSearchInput(""); // reset input when changing type
              }}
            >
              <option value="name">Search By Name</option>
              <option value="id">Search By ID</option>
            </select>
          </div>

          <div className="f-row-input">
            <label>
              {searchType === "name" ? "Institute Name:" : "Institute ID:"}
            </label>

            <input
              value={searchInput}
              onChange={(e) => {
                const value = e.target.value;

                // ✅ If ID → allow only numbers
                if (searchType === "id") {
                  if (/^\d*$/.test(value)) {
                    setSearchInput(value);
                  }
                } else {
                  setSearchInput(value);
                }
              }}
              placeholder={
                searchType === "name"
                  ? "Search institute by name..."
                  : "Enter institute ID..."
              }
            />
          </div>

          <button className="f-btn" onClick={handleSearch}>
            Search
          </button>

          <p className="f-clear" onClick={handleClear}>
            Clear Search & Filter
          </p>

          <hr className="f-hr" />
          <p className="f-sub">Other Actions:</p>

          <button className="f-btn" onClick={() => handleAddInstitute()}>
            Add New Institute
          </button>

          <hr className="f-hr" />
          {/* <p className="f-clear" onClick={handleClear}>Clear Filter</p> */}
        </aside>

        {/* ══════════ MAIN CONTENT ══════════ */}
        <div className="main-content">
          {/* Title */}
          <div className="institute-header">
            <h1>Institution</h1>

            {/* Filter toggle — mobile only */}
            <div className="mob-filter-bar">
              <button
                className="mob-filter-btn"
                ref={buttonRef}
                onClick={toggleFilter}
              >
                {isFilterOpen ? "Hide Filters" : "Filter By"}
              </button>
            </div>
          </div>

          {/* Table */}
          <div
            className={`content-blur-target ${isFilterOpen ? "content-blur-target--blurred" : ""}`}
          >
            <div className="table-wrap">
              <table className="inst-table">
                <thead>
                  <tr>
                    <th>S. No.</th>
                    <th>Institute ID</th>
                    <th>Institute Name</th>
                    <th>Institute Type</th>
                    <th>City/State</th>
                    <th>Is Registered</th>
                    <th>Standard Type</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="no-data">
                        No institutions found.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, idx) => (
                      <tr key={row.id}>
                        <td>{serialStart + idx + 1}</td>
                        <td>{row.institute_id}</td>
                        <td>{row.institute_name}</td>
                        <td>{row.institute_type}</td>
                        <td>
                          {row.institute_city},{row.institute_state}
                        </td>
                        <td>{row.registered_with_us == 1 ? "Yes" : "No"}</td>

                        <td>
                          <FaEye
                            size={18}
                            style={{ cursor: "pointer", color: "#007bff" }}
                            title="View Standards"
                            onClick={() =>
                              handleViewStandards(
                                row.institute_id,
                                row.institute_type,
                              )
                            }
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button
                className="pg-arrow"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                &#9664;
              </button>

              <span className="pg-label">{pageLabel}</span>

              <button
                className="pg-arrow"
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={
                  page === pagination.totalPages || pagination.totalPages === 0
                }
              >
                &#9654;
              </button>
            </div>
          </div>
        </div>
      </div>

      {showStandardsModal && (
        <div className="modal-overlay">
          <div className="manage-modal">
            <div className="modal-header">
              <h3>{standardTitle}</h3>

              <button
                className="close-btn"
                onClick={() => setShowStandardsModal(false)}
              >
                ✕
              </button>
            </div>

            <table className="standard-table">
              <thead>
                <tr>
                  <th>S.No.</th>
                  <th>{standardTitle}</th>
                  <th>Creator ID</th>
                  <th>Creator Name</th>
                </tr>
              </thead>

              <tbody>
                {standardData.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="no-data">
                      No {standardTitle.toLowerCase()} found.
                    </td>
                  </tr>
                ) : (
                  standardData.map((item, index) => (
                    <tr key={item.standard_id}>
                      <td>{index + 1}</td>
                      <td>{item.item_name}</td>
                      <td>{item.creator_id}</td>
                      <td>{item.creator_name}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
export default Manageinstitutes;

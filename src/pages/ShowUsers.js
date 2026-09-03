import React, { useState, useEffect, useRef, useContext } from "react";
import "./css/ShowUsers.css";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import axios from "axios";
import { toast } from "react-toastify";

const USER_TYPES = [
  "---Select User Type---",
  "Teacher",
  "Admin",
  "Student",
  "Others",
];
const PAGE_SIZE = 10;

const ShowUsers = () => {
  const { user } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [cursorStack, setCursorStack] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [userType, setUserType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchType, setSearchType] = useState("name");
  const [searchInput, setSearchInput] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedSearch, setAppliedSearch] = useState("");
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;
  const filterRef = useRef(null);
  const buttonRef = useRef(null);
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    userId: null,
  });

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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFilterOpen]);

  useEffect(() => {
    resetPagination();
    fetchUsers(null, "next");
  }, [userType, startDate, endDate]);

  const handleSearch = () => {
    resetPagination();
    setAppliedSearch(searchInput);
  };

  useEffect(() => {
    fetchUsers(null, "next");
  }, [appliedSearch]);

  const fetchUsers = async (cursor = null, direction = "next") => {
    try {
      const params = { direction };
      if (userType && userType !== "---Select User Type---") {
        params.role = userType;
      }
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (appliedSearch) params.search = appliedSearch;
      if (cursor) params.cursor = cursor;

      const url =
        user?.role_id === 3
          ? `${API_URL}/user/students/${user.institute_id}`
          : `${API_URL}/user/all-users`;

      const res = await axios.get(url, { params });

      setUsers(res.data.users);
      setNextCursor(res.data.nextCursor);
      setHasMore(res.data.hasMore);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    }
  };

  const resetPagination = () => {
    setPage(1);
    setCursorStack([]);
    setNextCursor(null);
  };

  useEffect(() => {
    fetchUsers(null, "next");
  }, []);

  const handleNext = () => {
    if (!hasMore) return;
    const currentFirstId = users.length > 0 ? users[0].user_id : null;
    setCursorStack((prev) => [...prev, currentFirstId]);
    fetchUsers(nextCursor, "next");
    setPage((p) => p + 1);
  };

  const handlePrev = () => {
    if (page <= 1) return;
    const stack = [...cursorStack];
    const prevCursor = stack.pop();
    setCursorStack(stack);
    setPage((p) => p - 1);
    if (stack.length === 0) {
      fetchUsers(null, "next");
    } else {
      fetchUsers(prevCursor, "prev");
    }
  };

  const clearFilters = () => {
    setUserType("");
    setStartDate("");
    setEndDate("");
    setSearchInput("");
    setSearchType("name");
    setAppliedSearch("");
    resetPagination();
    fetchUsers(null, "next");
    setCursorStack([]);
    setPage(1);
    setNextCursor(null);

    const url =
      user?.role_id === 3
        ? `${API_URL}/user/students/${user.institute_id}`
        : `${API_URL}/user/all-users`;

    axios
      .get(url, { params: { direction: "next" } })
      .then((res) => {
        setUsers(res.data.users);
        setNextCursor(res.data.nextCursor);
        setHasMore(res.data.hasMore);
      })
      .catch(console.error);
  };

  const handleDeleteUser = (userId) => {
    setConfirmDelete({ open: true, userId });
  };

  const onConfirmDeleteYes = async () => {
    const userId = confirmDelete.userId;
    setConfirmDelete({ open: false, userId: null });
    try {
      const response = await axios.delete(
        `${API_URL}/user/delete-user/${userId}`,
      );
      toast.success(response.data.message);
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.user_id !== userId),
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete user");
    }
  };

  const onConfirmDeleteNo = () => {
    setConfirmDelete({ open: false, userId: null });
  };

  const handleUserDetails = async (userId) => {
    navigate(`/dashboard/manageuser/showusers/${userId}`);
  };

  const pageStart = (page - 1) * PAGE_SIZE + 1;
  const pageEnd = pageStart + users.length - 1;

  return (
    <div className="su-root">
      {confirmDelete.open && (
        <div className="su-modal-overlay">
          <div className="su-modal-box">
            <div className="su-modal-icon">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 6H21"
                  stroke="#c7435b"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M8 6V4H16V6"
                  stroke="#c7435b"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M6 6L7 20H17L18 6"
                  stroke="#c7435b"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="su-modal-title">Delete this user?</h3>
            <p className="su-modal-text">
              This action cannot be undone. The user will be permanently
              removed.
            </p>
            <div className="su-modal-actions">
              <button
                className="su-modal-confirm-btn"
                onClick={onConfirmDeleteYes}
              >
                Yes, Delete
              </button>
              <button
                className="su-modal-cancel-btn"
                onClick={onConfirmDeleteNo}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="su-body">
        {isFilterOpen && (
          <div
            className="su-filter-backdrop"
            onClick={() => setIsFilterOpen(false)}
          />
        )}

        <aside
          className={`su-filter${isFilterOpen ? " su-filter--open" : ""}`}
          ref={filterRef}
        >
          <h2 className="su-filter-title">Filter By:</h2>

          {user?.role_id !== 3 && (
            <div className="su-filter-group">
              <label>User Type</label>
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
              >
                {USER_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="su-filter-group">
            <label>From</label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="su-filter-group">
            <label>To</label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="su-filter-group">
            <label>Search By:</label>
            <select
              value={searchType}
              onChange={(e) => {
                setSearchType(e.target.value);
                setSearchInput("");
              }}
            >
              <option value="name">Search By Name</option>
              <option value="id">Search By User ID</option>
            </select>
          </div>

          <div className="su-filter-group">
            <label>{searchType === "name" ? "User Name:" : "User ID:"}</label>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                const v = e.target.value;
                if (searchType === "id") {
                  if (/^\d*$/.test(v)) setSearchInput(v);
                } else {
                  setSearchInput(v);
                }
              }}
              placeholder={
                searchType === "name" ? "Search by name..." : "Enter User ID..."
              }
            />
          </div>

          <button className="su-apply-btn" onClick={handleSearch}>
            Search
          </button>

          <div className="su-clear-filter" onClick={clearFilters}>
            Clear Search & Filter
          </div>
        </aside>

        <div className="su-main">
          <div className="su-header">
            <h1 className="su-page-title">
              {user?.role_id === 3 ? "Manage Students" : "Show Users"}
            </h1>
            <div className="su-mobile-header">
              <button
                className="su-filter-toggle"
                ref={buttonRef}
                onClick={() => setIsFilterOpen((v) => !v)}
              >
                {isFilterOpen ? "Hide Filters" : "Filter By"}
              </button>
            </div>
          </div>

          <div className="su-card">
            <div className="su-table-wrapper">
              <table className="su-table">
                <thead>
                  <tr>
                    <th>S. No.</th>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile Number</th>
                    {user?.role_id !== 3 && <th>User Type</th>}
                    <th>View</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="su-empty">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((u, i) => (
                      <tr
                        key={u.user_id}
                        className={i % 2 === 0 ? "su-row-even" : ""}
                      >
                        <td>{pageStart + i}</td>
                        <td>{u.user_id}</td>
                        <td>{u.name}</td>
                        <td>{u.user_email}</td>
                        <td>{u.user_mobile}</td>
                        {user?.role_id !== 3 && (
                          <td>
                            {{
                              1: "Super-Admin",
                              2: "Admin",
                              3: "Teacher",
                              4: "Student",
                              5: "Normal User",
                            }[u.role_id] || "Unknown"}
                          </td>
                        )}
                        <td>
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleUserDetails(u.user_id)}
                          >
                            <path
                              d="M1 12C3 7 7 4 12 4C17 4 21 7 23 12C21 17 17 20 12 20C7 20 3 17 1 12Z"
                              stroke="black"
                              strokeWidth="2"
                            />
                            <circle
                              cx="12"
                              cy="12"
                              r="3"
                              stroke="black"
                              strokeWidth="2"
                            />
                          </svg>
                        </td>
                        <td>
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleDeleteUser(u.user_id)}
                          >
                            <path d="M3 6H21" stroke="black" strokeWidth="2" />
                            <path
                              d="M8 6V4H16V6"
                              stroke="black"
                              strokeWidth="2"
                            />
                            <path
                              d="M6 6L7 20H17L18 6"
                              stroke="black"
                              strokeWidth="2"
                            />
                          </svg>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="su-pagination">
              <button
                className="su-page-btn"
                onClick={handlePrev}
                disabled={page === 1}
              >
                &#9664;
              </button>
              <span className="su-page-info">
                {users.length === 0
                  ? "0"
                  : `${pageStart} – ${pageEnd} of ${total}`}
              </span>
              <button
                className="su-page-btn"
                onClick={handleNext}
                disabled={!hasMore}
              >
                &#9654;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowUsers;

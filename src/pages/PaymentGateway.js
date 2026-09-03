import React, { useState, useEffect, useContext, useRef } from "react";
import "./css/PaymentGateway.css";
import { UserContext } from "../contexts/UserContext";
import { useAxios } from "../api/axiosInstance";
import { FaEye, FaSearch, FaTimes } from "react-icons/fa";

const PaymentGateway = () => {
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

  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [paymentStatus, setPaymentStatus] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");

  const [dateRange, setDateRange] = useState("");

  const [fromDate, setFromDate] = useState("");

  const [toDate, setToDate] = useState("");

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [totalRecords, setTotalRecords] = useState(0);

  const [summary, setSummary] = useState({
    totalRevenue: 0,

    todayRevenue: 0,

    paidCount: 0,

    failedCount: 0,
  });

  const [pageSize, setPageSize] = useState(10);

  const getStatus = (status) => {
    const colors = {
      PAID: "#28a745",

      FAILED: "#dc3545",

      CREATED: "#6c757d",

      PROCESSING: "#ffc107",

      REFUNDED: "#17a2b8",
    };

    return (
      <span className="payment-status">
        <span
          className="status-dot"
          style={{
            background: colors[status] || "#999",
          }}
        />

        {status}
      </span>
    );
  };

  const handleViewPayment = async (paymentId) => {
    try {
      const res = await axios.get(
        `${API_URL}/payment/admin-payment-details/${paymentId}`,
      );

      if (res.data.success) {
        setSelectedPayment(res.data.payment);

        setShowPaymentModal(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getPayments();
  }, [paymentStatus, paymentMethod, search, dateRange, fromDate, toDate, page]);

  const getPayments = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/payment/admin-payment-history`,

        {
          params: {
            status: paymentStatus,

            paymentMethod,

            search,

            dateRange,

            fromDate,

            toDate,

            page,
          },
        },
      );

      console.log("⬅️ Response page:", page);
      console.log("Backend currentPage:", res.data.pagination.currentPage);

      console.log("Number of payments:", res.data.payments.length);

      if (res.data.success) {
        setSummary(res.data.summary);
        setPayments(res.data.payments);
        setTotalPages(res.data.pagination.totalPages);
        setTotalRecords(res.data.pagination.totalRecords);
        setPageSize(res.data.pagination.pageSize);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const toggleFilter = () => {
    // setIsFilterOpen(!isFilterOpen);
    setIsFilterOpen((prev) => !prev);
  };

  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isFilterOpen]);

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

  console.log(
    "RENDERING PAGE:",
    page,
    "ROWS:",
    payments.length,
    "IDS:",
    payments.map((p) => p.payment_id),
  );

  return (
    <div className="pastTest">
      {/*****Filter section */}
      <div className="Sticky-filterby">
        <div
          className={`filter-section ${isFilterOpen ? "filter-section--open" : ""}`}
          ref={filterRef}
        >
          <h2>Filter By</h2>

          <hr />

          {/* Payment Status */}

          <div className="filter-group">
            <label>Payment Status</label>

            <select
              value={paymentStatus}
              onChange={(e) => {
                setPaymentStatus(e.target.value);

                setPage(1);
              }}
            >
              <option value="">All</option>

              <option value="PAID">Paid</option>

              <option value="FAILED">Failed</option>

              <option value="CREATED">Cancelled</option>

              <option value="PROCESSING">Processing</option>
            </select>
          </div>

          <hr />

          {/* Payment Method */}

          <div className="filter-group">
            <label>Payment Method</label>

            <select
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);

                setPage(1);
              }}
            >
              <option value="">All</option>

              <option value="upi">UPI</option>

              <option value="card">Card</option>

              <option value="netbanking">Net Banking</option>

              <option value="wallet">Wallet</option>

              <option value="emi">EMI</option>
            </select>
          </div>

          <hr />

          {/* Date */}

          <div className="filter-group">
            <label>Date</label>

            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);

                setPage(1);
              }}
            >
              <option value="">All</option>

              <option value="today">Today</option>

              <option value="last7">Last 7 Days</option>

              <option value="last30">Last 30 Days</option>

              <option value="last90">Last 3 Months</option>

              <option value="custom">Custom</option>
            </select>

            {dateRange === "custom" && (
              <>
                <br />

                <label>From</label>

                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />

                <br />

                <label>To</label>

                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </>
            )}
          </div>

          <hr />

          {/* Search */}

          <div className="filter-group">
            <label>Search</label>

            <div className="search-wrap">
              <FaSearch className="search-icon" />

              <input
                value={search}
                placeholder="Payment ID / User / Quiz"
                onChange={(e) => {
                  setSearch(e.target.value);

                  setPage(1);
                }}
              />

              {search && (
                <FaTimes
                  className="search-clear-icon"
                  title="Clear search"
                  onClick={() => {
                    setSearch("");

                    setPage(1);
                  }}
                />
              )}
            </div>
          </div>

          <hr />

          {/* Clear Filters */}

          <button
            type="button"
            className="clear-filters-btn"
            onClick={() => {
              setPaymentStatus("");

              setPaymentMethod("");

              setSearch("");

              setDateRange("");

              setFromDate("");

              setToDate("");

              setPage(1);
            }}
          >
            Clear Search &amp; Filter
          </button>
        </div>

        {/* Mobile Filter Background Overlay */}
        {isFilterOpen && (
          <div
            className="filter-backdrop"
            onClick={() => setIsFilterOpen(false)}
          />
        )}
      </div>

      {/***main section starts */}
      <div className="pastTest-main-section">
        {/***header ***** */}
        <div className="pastTest-header">
          <h1>Payment Gateway</h1>
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

        <div className="payment-summary">
          <div className="summary-card revenue">
            <div className="summary-title">Total Revenue</div>

            <div className="summary-value">₹ {summary.totalRevenue}</div>
          </div>

          <div className="summary-card today">
            <div className="summary-title">Today's Revenue</div>

            <div className="summary-value">₹ {summary.todayRevenue}</div>
          </div>

          <div className="summary-card paid">
            <div className="summary-title">Paid Payments</div>

            <div className="summary-value">{summary.paidPayments}</div>
          </div>

          <div className="summary-card failed">
            <div className="summary-title">Failed Payments</div>

            <div className="summary-value">{summary.failedPayments}</div>
          </div>
        </div>

        {/***Table container****/}
        <div className="table-container">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>S.No.</th>
                  <th>Payment ID</th>
                  <th>Name</th>
                  <th>Quiz Name</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody key={page}>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="9">No Payments Found</td>
                  </tr>
                ) : (
                  payments.map((payment, index) => (
                    <tr key={`${payment.order_id}-${payment.payment_id}`}>
                      <td>{(page - 1) * 10 + index + 1}</td>

                      <td>{payment.payment_id || "-"}</td>

                      <td>{payment.student_name}</td>

                      <td>{payment.test_name}</td>

                      <td>₹ {payment.amount}</td>

                      <td>{payment.payment_method || "-"}</td>

                      <td>{new Date(payment.created_at).toLocaleString()}</td>

                      <td>{getStatus(payment.status)}</td>

                      <td>
                        {payment.payment_id ? (
                          <FaEye
                            className="view-icon"
                            onClick={() =>
                              handleViewPayment(payment.payment_id)
                            }
                            title="View Payment Details"
                          />
                        ) : (
                          <FaEye
                            className="view-icon disabled-eye"
                            title="Payment details are not available because no payment was made."
                          />
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              Previous
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {showPaymentModal && selectedPayment && (
        <div className="payment-modal-overlay">
          <div className="payment-modal">
            <div className="payment-modal-header">
              <h2>Payment Details</h2>

              <button
                className="close-modal-btn"
                onClick={() => {
                  setShowPaymentModal(false);

                  setSelectedPayment(null);
                }}
              >
                ✕
              </button>
            </div>

            {/* ====================================== */}

            {/* Payment Information */}

            {/* ====================================== */}

            <div className="payment-section">
              <h3>Payment Information</h3>

              <div className="payment-grid">
                <div>Payment ID</div>
                <div>{selectedPayment.payment_id}</div>

                <div>Order ID</div>
                <div>{selectedPayment.order_id}</div>

                <div>Receipt</div>
                <div>{selectedPayment.receipt}</div>

                <div>Amount</div>
                <div>₹ {selectedPayment.amount}</div>

                <div>Currency</div>
                <div>{selectedPayment.currency}</div>

                <div>Status</div>
                <div>{getStatus(selectedPayment.status)}</div>

                <div>Payment Method</div>
                <div>{selectedPayment.payment_method || "-"}</div>
              </div>
            </div>

            {/* ====================================== */}

            {/* Student */}

            {/* ====================================== */}

            <div className="payment-section">
              <h3>Student Information</h3>

              <div className="payment-grid">
                <div>Student ID</div>

                <div>{selectedPayment.user_id}</div>

                <div>Name</div>

                <div>{selectedPayment.name}</div>

                <div>Email</div>

                <div>{selectedPayment.email}</div>

                <div>Mobile</div>

                <div>{selectedPayment.mobile}</div>
              </div>
            </div>

            {/* ====================================== */}

            {/* Test */}

            {/* ====================================== */}

            <div className="payment-section">
              <h3>Quiz Information</h3>

              <div className="payment-grid">
                <div>Test ID</div>

                <div>{selectedPayment.test_id}</div>

                <div>Quiz Name</div>

                <div>{selectedPayment.test_name}</div>

                <div>Quiz Fees</div>

                <div>₹ {selectedPayment.test_fees}</div>

                <div>Category</div>

                <div>{selectedPayment.category}</div>
              </div>
            </div>

            {/* ====================================== */}

            {/* Razorpay */}

            {/* ====================================== */}

            <div className="payment-section">
              <h3>Razorpay Information</h3>

              <div className="payment-grid">
                <div>Razorpay Order ID</div>

                <div>{selectedPayment.razorpay_order_id}</div>

                <div>Razorpay Payment ID</div>

                <div>{selectedPayment.razorpay_payment_id || "-"}</div>

                <div>Failure Reason</div>

                <div>{selectedPayment.failure_reason || "-"}</div>

                <div>Order Created</div>

                <div>
                  {new Date(selectedPayment.order_created_at).toLocaleString()}
                </div>

                <div>Payment Time</div>

                <div>
                  {selectedPayment.payment_created_at
                    ? new Date(
                        selectedPayment.payment_created_at,
                      ).toLocaleString()
                    : "-"}
                </div>
              </div>
            </div>

            <div className="payment-modal-footer">
              <button
                className="close-payment-btn"
                onClick={() => {
                  setShowPaymentModal(false);

                  setSelectedPayment(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default PaymentGateway;

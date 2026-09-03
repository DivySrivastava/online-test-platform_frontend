import React, { useState, useEffect, useContext, useRef } from 'react';
import './css/PaymentDetails.css';
import { UserContext } from "../contexts/UserContext";
import { useAxios } from "../api/axiosInstance";
import { openRazorpay } from "../utils/paymentHelper";
import { waitForFinalStatus } from "../utils/paymentHelper";
import { checkPaymentStatus } from "../utils/paymentHelper";

const PaymentDetails = () => {


    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterRef = useRef(null);
    const buttonRef = useRef(null);
    const [payments, setPayments] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState("");

    const [search, setSearch] = useState("");

    const [dateRange, setDateRange] = useState("");

    const [fromDate, setFromDate] = useState("");

    const [toDate, setToDate] = useState("");

    const [paymentStatus, setPaymentStatus] = useState("");

    const [paymentMessage, setPaymentMessage] = useState("");

    const [showPaymentResultModal, setShowPaymentResultModal] = useState(false);

    const { user } = useContext(UserContext);
    const user_id = user?.id;
    const API_URL = process.env.REACT_APP_API_URL;
    const axios = useAxios();


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

    useEffect(() => {

        if (user) {

            getPayments();

        }

    }, [
        user,
        page,
        status,
        search,
        dateRange,
        fromDate,
        toDate
    ]);


    useEffect(() => {

        setPage(1);

    }, [
        status,
        search,
        dateRange,
        fromDate,
        toDate
    ]);


    const getPayments = async () => {

        try {

            const res = await axios.get(
                `${API_URL}/payment/payment-history`,
                {
                    params: {

                        student_id: user_id,

                        page,

                        status,

                        search,

                        dateRange,

                        fromDate,

                        toDate

                    }
                }
            );

            setPayments(res.data.payments);

            setTotalPages(res.data.pagination.totalPages);

        }

        catch (err) {

            console.log(err);

        }

    };



    const downloadReceipt = async (orderId) => {

        try {

            const response = await axios.get(

                `${API_URL}/payment/receipt/${orderId}`,

                {
                    responseType: "blob"
                }

            );

            const url = window.URL.createObjectURL(
                new Blob([response.data])
            );

            const link = document.createElement("a");

            link.href = url;

            link.setAttribute(

                "download",

                `Receipt_${orderId}.pdf`

            );

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

        }

        catch (err) {

            console.log(err);

            alert("Unable to download receipt.");

        }

    };

    const isPaymentAllowed = (payment) => {

        console.log("payment.test_status", payment.test_status);

        return payment.test_status !== "Expired";

    };

    const payForTest = async (payment) => {

        try {

            // Create a fresh Razorpay order
            const res = await axios.post(

                `${API_URL}/payment/create-order`,

                {

                    student_id: user.id,

                    test_id: payment.test_id

                }

            );

            const callbacks = {

                setPaymentStatus,

                setPaymentMessage,

                setShowPaymentResultModal,

                setPurchasedTests: () => { },

                handleTest: null,

                onSuccess: getPayments

            };

            openRazorpay(

                res.data,

                payment,

                "PLAY",

                user,

                axios,

                API_URL,

                callbacks

            );

        }

        catch (err) {

            console.log(err);

            alert(

                err.response?.data?.message ||

                "Unable to create payment."

            );

        }

    };


    return (
        <div className="paymentDetail">
            {/*****Filter section */}
            <div className="Sticky-filterby">
                <div className={`filter-section ${isFilterOpen ? 'filter-section--open' : ''}`} ref={filterRef}>
                    <h2>Filter By</h2>
                    <hr />
                    <div className="filter-group">
                        <label>Payment Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >

                            <option value="">All</option>
                            <option value="PAID">Paid</option>
                            <option value="FAILED">Failed</option>
                            <option value="CREATED">Cancelled</option>
                            <option value="PROCESSING">Processing</option>

                        </select>
                    </div>
                    <hr />
                    <div className="filter-group">
                        <label>Date</label>
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                        >

                            <option value="">All</option>

                            <option value="today">Today</option>

                            <option value="last7">Last 7 Days</option>

                            <option value="last30">Last 30 Days</option>

                            <option value="last90">Last 3 Months</option>

                            <option value="custom">Custom</option>

                        </select>
                        {
                            dateRange === "custom" && (

                                <>

                                    From:

                                    <input
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                    />

                                    <br />

                                    To:

                                    <input
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                    />

                                </>

                            )
                        }
                    </div>
                    <hr />
                    <div className="filter-group">
                        <label>Search </label>
                        <input

                            value={search}

                            onChange={(e) => setSearch(e.target.value)}

                            placeholder="Enter Test Name"

                        />
                    </div>
                    <hr />

                    <div
                        className="clear-filters"
                        onClick={() => {

                            setStatus("");

                            setSearch("");

                            setDateRange("");

                            setFromDate("");

                            setToDate("");

                        }}
                    >

                        Clear Search & Filter

                    </div>
                </div>
            </div>
            {/***main section starts */}
            <div className="paymentDetail-main-section">
                {/***header ***** */}
                <div className="paymentDetail-header">
                    <h1>Payment Details</h1>
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
                                <th>Payment ID</th>
                                <th>Quiz Name</th>
                                <th>Amount</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Action</th>

                            </tr>

                        </thead>
                        <tbody>
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: "center" }}>No Payment Details found.</td>
                                </tr>
                            ) : (
                                payments.map((payment, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{payment.razorpay_payment_id || "-"}</td>
                                        <td>{payment.test_name}</td>
                                        <td>₹ {payment.amount}</td>
                                        <td>
                                            {payment.payment_date
                                                ? new Date(payment.payment_date).toLocaleString("en-IN")
                                                : "-"}
                                        </td>
                                        <td>
                                            <div className="payment-status">
                                                <span
                                                    className={`status-dot ${payment.status.toLowerCase()}`}
                                                ></span>

                                                <span>{payment.status}</span>
                                            </div>
                                        </td>
                                        <td>

                                            {
                                                payment.status === "PAID"

                                                    ?

                                                    <button
                                                        className="receipt-btn"
                                                        type="button"
                                                        onClick={() => downloadReceipt(payment.order_id)}
                                                    >

                                                        📄 Download Receipt

                                                    </button>

                                                    :

                                                    payment.status === "FAILED"

                                                        ?

                                                        <button
                                                            type="button"
                                                            disabled={!isPaymentAllowed(payment)}
                                                            title={
                                                                !isPaymentAllowed(payment)
                                                                    ? "This test has expired. Payment is no longer allowed."
                                                                    : ""
                                                            }
                                                            onClick={() => payForTest(payment)}
                                                        >
                                                            Retry Payment
                                                        </button>

                                                        :

                                                        payment.status === "CREATED"

                                                            ?

                                                            <button
                                                                type="button"
                                                                disabled={!isPaymentAllowed(payment)}
                                                                title={
                                                                    !isPaymentAllowed(payment)
                                                                        ? "This test has expired. Payment is no longer allowed."
                                                                        : ""
                                                                }
                                                                onClick={() => payForTest(payment)}
                                                            >
                                                                Pay Again
                                                            </button>

                                                            :

                                                            "Processing"

                                            }

                                        </td>
                                    </tr>
                                )))}
                        </tbody>
                    </table>
                    <div className="pagination">

                        <button

                            disabled={page === 1}

                            onClick={() => setPage(page - 1)}

                        >

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
            {showPaymentResultModal && (
                <div className="payment-result-overlay">
                    <div className="payment-result-modal">

                        <div
                            className={
                                paymentStatus === "SUCCESS"
                                    ? "payment-success-icon"
                                    : "payment-failed-icon"
                            }
                        >
                            {paymentStatus === "SUCCESS" ? "✅" : "❌"}
                        </div>

                        <h2>
                            {paymentStatus === "SUCCESS"
                                ? "Payment Successful"
                                : "Payment Failed"}
                        </h2>

                        <p>{paymentMessage}</p>

                    </div>
                </div>
            )}

        </div>
    );
};

export default PaymentDetails;





export const openRazorpay = (
    data,
    test,
    action,
    user,
    axios,
    API_URL,
    callbacks
) => {

    const {

        setPaymentStatus,

        setPaymentMessage,

        setShowPaymentResultModal,

        setPurchasedTests,

        handleTest,

        onSuccess

    } = callbacks;

    const showResult = (status, message, success = false) => {

        setPaymentStatus(status);
        setPaymentMessage(message);
        setShowPaymentResultModal(true);

        if (success) {

            setPurchasedTests(prev => ({
                ...prev,
                [test.test_id]: true
            }));

        }

        setTimeout(async () => {

            setShowPaymentResultModal(false);

            if (success) {

                // TakeQuiz.js
                if (action === "PLAY" && typeof handleTest === "function") {

                    handleTest(test);

                }

                // PaymentDetails.js
                if (typeof onSuccess === "function") {

                    await onSuccess();

                }

            }

        }, 5000);

    };

    const options = {

        key: data.razorpay_key,

        amount: data.order.amount,

        currency: data.order.currency,

        order_id: data.order.order_id,

        name: "Online Quiz Platform",

        description: data.quiz.quiz_name,

        prefill: {
            name: user.name,
            email: user.user_email,
            contact: user.user_mobile
        },

        theme: {
            color: "#3399cc"
        },

        handler: async function (response) {

            try {

                const verify = await axios.post(
                    `${API_URL}/payment/verify-payment`,
                    {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature
                    }
                );

                if (verify.data.success) {

                    if (action === "ENROLL") {

                        showResult(
                            "SUCCESS",
                            "🎉 Your payment was successful!\n\nYou have been enrolled in the quiz. You can attempt it once it becomes Live.",
                            true
                        );

                    } else {

                        showResult(
                            "SUCCESS",
                            "🎉 Your payment was successful!\n\nYour quiz is now unlocked. Best of luck!",
                            true
                        );

                    }

                } else {

                    showResult(
                        "FAILED",
                        "Payment could not be verified.\n\nIf the amount has been deducted, it will be refunded according to your bank's processing time."
                    );

                }

            } catch (err) {

                console.error(err);

                showResult(
                    "PENDING",
                    "Your payment has been received but could not be verified immediately.\n\nPlease wait a few moments and refresh the page. If payment was successful, your quiz will be unlocked automatically."
                );

            }

        },

        modal: {

            ondismiss: async function () {

                const status = await waitForFinalStatus(

                    data.order.order_id,

                    axios,

                    API_URL

                );

                if (!status) {

                    showResult(
                        "PENDING",
                        "Unable to determine payment status.\n\nPlease refresh the page after a few moments."
                    );

                    return;

                }

                switch (status.status) {

                    case "CREATED":

                        showResult(
                            "CANCELLED",
                            "You closed the payment window before completing the payment.\n\nNo payment has been received."
                        );

                        break;

                    case "PAID":

                        if (action === "ENROLL") {

                            showResult(
                                "SUCCESS",
                                "🎉 Your payment was successful!\n\nYou have been enrolled in the quiz.",
                                true
                            );

                        } else {

                            showResult(
                                "SUCCESS",
                                "🎉 Your payment was successful!\n\nYour quiz has been unlocked.",
                                true
                            );

                        }

                        break;

                    case "FAILED":

                        showResult(
                            "FAILED",
                            `Your payment could not be completed.\n\n${status.reason ? "Reason: " + status.reason : "Please try again."}`
                        );

                        break;

                    case "REFUNDED":

                        showResult(
                            "REFUNDED",
                            "Your payment has been refunded.\n\nThe amount will be credited back to your original payment method according to your bank's processing time."
                        );

                        break;

                    case "PENDING":

                        showResult(
                            "PENDING",
                            "Your payment is still being verified.\n\nPlease wait a few moments and refresh the page."
                        );

                        break;

                    default:

                        showResult(
                            "PENDING",
                            "We are verifying your payment.\n\nPlease refresh the page after a few moments."
                        );

                }

            }

        }

    };

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", async function (response) {

        console.log("Payment Failed:", response.error);

        const status = await waitForFinalStatus(

            response.error.metadata.order_id,

            axios,

            API_URL

        );

        if (!status) {

            showResult(
                "PENDING",
                "Unable to determine payment status.\n\nPlease refresh the page after a few moments."
            );

            return;

        }

        switch (status.status) {

            case "FAILED":

                showResult(
                    "FAILED",
                    `Your payment could not be completed.\n\n${status.reason ? "Reason: " + status.reason : "Please try again."}`
                );

                break;

            case "CAPTURED":

                if (action === "ENROLL") {

                    showResult(
                        "SUCCESS",
                        "🎉 Your payment was successful!\n\nYou have been enrolled in the quiz.",
                        true
                    );

                } else {

                    showResult(
                        "SUCCESS",
                        "🎉 Your payment was successful!\n\nYour quiz has been unlocked.",
                        true
                    );

                }

                break;

            case "REFUNDED":

                showResult(
                    "REFUNDED",
                    "Your payment has been refunded.\n\nThe amount will be credited back to your original payment method according to your bank's processing time."
                );

                break;

            case "PENDING":

                showResult(
                    "PENDING",
                    "Your payment is being verified.\n\nPlease wait a few moments and refresh the page."
                );

                break;

            default:

                showResult(
                    "FAILED",
                    "Payment could not be completed."
                );

        }

    });

    rzp.open();

};


export const waitForFinalStatus = async (

    orderId,

    axios,

    API_URL

) => {

    for (let i = 0; i < 5; i++) {

        const res = await checkPaymentStatus(

            orderId,

            axios,

            API_URL

        );

        console.log("Payment Status:", res);

        if (!res) continue;

        // Payment completed
        if (res.status === "PAID") {
            return res;
        }

        // Payment failed
        if (res.status === "FAILED") {
            return res;
        }

        // User closed popup
        if (res.status === "CREATED") {
            return res;
        }

        await new Promise(resolve => setTimeout(resolve, 5000));

    }

    return {
        status: "PENDING"
    };

};


export const checkPaymentStatus = async (
    orderId,
    axios,
    API_URL
) => {

    try {

        const res = await axios.get(
            `${API_URL}/payment/status/${orderId}`
        );

        return res.data;

    }

    catch (err) {

        return null;

    }

};


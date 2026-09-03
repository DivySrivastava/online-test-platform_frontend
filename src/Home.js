import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import AOS from "aos";
import "aos/dist/aos.css";
import { useNavigate } from "react-router-dom";
import useAuth from "./utils/auth";
import { useAxios } from "./api/axiosInstance";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "./pages/css/TakeQuiz.css";
import "./App.css"; // i am using app.css for this purpose... :).

/* ── Hero slide captions data — har banner image ka apna text ── */
const heroSlides = [
  {
    image: "/images/banner1.jpg",
    alt: "Education",
    title: "Menstrual health awareness campaign.",
    subtitle: "Enhance your knowledge with our health awareness quiz!",
  },
  {
    image: "/images/banner2.jpg",
    alt: "Quiz",
    title: "Environment Day with a tree plantation drive",
    subtitle: "Take our quiz and increase environmental knowledge!",
  },
  {
    image: "/images/banner3.jpg",
    alt: "Students",
    title: "Reflecting our platform's mission to support learning at every level.",
    subtitle: "Join thousands of students — take a quiz and put your knowledge to the test!",
  },
  {
    image: "/images/banner4.jpg",
    alt: "Students",
    title: "Menstrual Health & Hygiene training session.",
    subtitle: "Take our health awareness quiz and learn more about menstrual hygiene!",
  },
];

const Hero = ({ tests }) => {
  const { isLoggedIn } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="home" className="hero" aria-label="Hero Section">
      <div className="hero-left">
        <h1>Online Test Platform provided by Sahash</h1>
        <p>
          Join our journey to educate, quiz your knowledge, and embrace humanity
          through science and learning.
        </p>

        {!isLoggedIn() && tests.length > 0 && (
          <button
            className="btn-primary"
            onClick={() =>
              document
                .getElementById("quiz")
                .scrollIntoView({ behavior: "smooth" })
            }
          >
            Take a Quiz Now
          </button>
        )}
      </div>

      <div className="hero-right">
        <Swiper
          modules={[Autoplay, Pagination]}
          slidesPerView={1}
          loop={true}
          observer={true}
          observeParents={true}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        >
          {heroSlides.map((slide, i) => (
            <SwiperSlide key={i}>
              <div className="hero-slide-wrapper">
                <img src={slide.image} alt={slide.alt} />
                <div className="hero-slide-overlay" />
                <div
                  className={`hero-slide-caption ${
                    activeIndex === i ? "hero-caption-active" : ""
                  }`}
                >
                  <h3>{slide.title}</h3>
                  <p>{slide.subtitle}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

const Education = () => (
  <section id="education" aria-labelledby="education-heading">
    <div className="container">
      <h2 id="education-heading">Educational Programs</h2>
      <article className="card" data-aos="fade-up">
        <img
          src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/b4733c0e-e546-4e27-a76c-c26ca524ce13.png"
          alt="Educational books and globe icon"
        />
        <h3> Industrial Training</h3>
        <p>
          Providing accessible education for all ages, with a focus on science,
          technology, and social skills.
        </p>
        <a
          href="https://www.techfeedosolutions.com/"
          className="learn-more"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn More
        </a>
      </article>
      <article className="card" data-aos="fade-up">
        <img
          src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/9f8395f2-68ad-48fb-9209-b831f08c8abf.png"
          alt="Community education group"
        />
        <h3>Community Outreach</h3>
        <p>
          Engaging local communities through workshops, seminars, and
          collaborative projects to foster growth.
        </p>
        <a
          href="https://sahashindia.org"
          className="learn-more"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn More
        </a>
      </article>
      <article className="card" data-aos="fade-up">
        <img
          src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/59241d21-0747-4976-9a06-b1f3a2d199f4.png"
          alt="Science education icon"
        />
        <h3>Science Literacy</h3>
        <p>
          Promoting scientific understanding and critical thinking skills for a
          better future.
        </p>
        <a
          href="https://sahashindia.org"
          className="learn-more"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn More
        </a>
      </article>
    </div>
  </section>
);

const Quiz = ({ tests }) => {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 900,
      once: true,
    });
  }, []);

  const handleCloseSnackbar = (_, reason) => {
    if (reason === "clickaway") return;
    setOpenSnackbar(false);
  };

  const handleTest = (test) => {
    if (isLoggedIn()) {
      if (test.test_status === "Approved") {
        alert(`Test will be live on ${test.test_date}`);
      } else if (test.test_status === "Live") {
        navigate(`/test/${test.test_id}`, {
          state: { test },
        });
      }
    } else {
      setOpenSnackbar(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const cardsPerView = 3;

  const isCarouselMode = tests.length > cardsPerView;

  const handleNext = () => {
    if (currentIndex + cardsPerView < tests.length) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Carousel mode में सिर्फ visible slice, वरना सारे tests एक साथ
  const displayedTests = isCarouselMode
    ? tests.slice(currentIndex, currentIndex + cardsPerView)
    : tests;

  const renderCard = (test, index) => (
    <div
      className={`test-card ${isCarouselMode ? "carousel-card" : "static-card"}`}
      key={test.test_id}
    >
      <h3>{test.test_name}</h3>
      <p className="desc">{test.test_description}</p>

      <div className="Status-Lang">
        <span className="test-status1">
          {test.test_status === "Live" && (
            <>
              <strong>Status: </strong>
              <i>Live</i>
            </>
          )}
          {test.test_status === "Approved" && (
            <p className="test-status2">
              <strong>Status: </strong>
              <i>Coming Soon</i>
            </p>
          )}
        </span>
        <span className="test-lang">
          <strong>Language: </strong>
          {test.test_lang === "both" && <i>English and Hindi</i>}
          {test.test_lang === "english" && <i>English</i>}
          {test.test_lang === "hindi" && <i>Hindi</i>}
        </span>
      </div>

      <div className="from-to">
        <p>
          <strong>From: </strong>
          {new Date(test.start_date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>
        <p>
          <strong>To: </strong>
          {new Date(test.end_date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>

      <div className="from-to">
        <p>
          {test.start_date
            ? new Date(test.start_date.replace(" ", "T")).toLocaleTimeString(
                "en-GB",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                  timeZone: "Asia/Kolkata",
                },
              )
            : "N/A"}{" "}
          (IST)
        </p>
        <p>
          {test.end_date
            ? new Date(test.end_date.replace(" ", "T")).toLocaleTimeString(
                "en-GB",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                  timeZone: "Asia/Kolkata",
                },
              )
            : "N/A"}{" "}
          (IST)
        </p>
      </div>

      <div className="test-details">
        <div className="detail-item">
          <img
            src={"/images/question.png"}
            alt="questions"
            className="icon-TakeQuiz"
          />
          <p>
            <strong>{test.no_of_ques} Questions</strong>
          </p>
        </div>
        <div className="vl"></div>
        <div className="detail-item">
          <img
            src={"/images/clock.png"}
            alt="Duration"
            className="icon-TakeQuiz"
          />
          <p>
            <strong>{test.test_duration} Minutes</strong>
          </p>
        </div>
        {test.pricing === "Paid" && (
          <>
            <div className="vl"></div>
            <div className="detail-item">
              <img
                src={"/images/fee.png"}
                alt="Fee"
                className="icon-TakeQuiz"
              />
              <p>
                <strong>Rs.{test.fee} Fees</strong>
              </p>
            </div>
          </>
        )}
      </div>

      <div className="test-footer">
        <div>
          <img
            src={"/images/certificate.png"}
            alt="Certificate"
            className="icon-TakeQuiz"
          />
          E-Certificate
        </div>
        <div>
          <img
            src={"/images/terms-and-conditions.png"}
            alt="Terms & Conditions"
            className="icon-TakeQuiz"
          />
          View T&C
        </div>
      </div>

      <div className="home-play-button">
        {test.test_status === "Live" && test.pricing === "Free" && (
          <button className="play-button" onClick={() => handleTest(test)}>
            Play
          </button>
        )}
        {test.test_status === "Live" && test.pricing === "Paid" && (
          <button className="play-button">Pay to Play Quiz</button>
        )}
        {test.test_status === "Approved" && test.pricing === "Free" && (
          <button className="play-button" disabled={true}>
            Play
          </button>
        )}
        {test.test_status === "Approved" && test.pricing === "Paid" && (
          <button className="play-button">Pay to Enroll in Quiz</button>
        )}
      </div>

      <br />
      <br />
      <hr />
      <p className="last-p">By: SAHASH</p>
    </div>
  );

  return (
    <>
      {tests.length > 0 && !isLoggedIn() && (
        <section
          id="quiz"
          aria-labelledby="quiz-heading"
          className="quiz-animated-bg"
        >
          <div className="quiz-bg-shape shape-1"></div>
          <div className="quiz-bg-shape shape-2"></div>
          <div className="quiz-bg-shape shape-3"></div>

          <div className="container quiz-container">
            <h2 id="quiz-heading">Active Quizzes</h2>

            {isCarouselMode ? (
              <>
                <button
                  className="carousel-arrow left-arrow"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  aria-label="Scroll to previous quizzes"
                >
                  ←
                </button>
                <div className="carousel-wrapper">
                  <div className="carousel">
                    {displayedTests.map((test, index) =>
                      renderCard(test, index),
                    )}
                  </div>
                </div>
                <button
                  className="carousel-arrow right-arrow"
                  onClick={handleNext}
                  disabled={currentIndex + cardsPerView >= tests.length}
                  aria-label="Scroll to next quizzes"
                >
                  →
                </button>
              </>
            ) : (
              <div className="static-cards-row">
                {displayedTests.map((test, index) => renderCard(test, index))}
              </div>
            )}
          </div>
        </section>
      )}

      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="warning"
          sx={{
            width: "400px",
            minHeight: "80px",
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          You should login first to play the quiz
        </Alert>
      </Snackbar>
    </>
  );
};

const HumanityScience = () => (
  <section id="humanity-science" aria-labelledby="humanity-science-heading">
    <div className="container">
      <h2 id="humanity-science-heading">Humanity & Science Highlights</h2>
      <div className="content-block">
        <img
          src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/7b846cc0-b3fc-4aa9-9c00-003f715bc931.png"
          alt="Volunteers helping children"
        />
        <h3>Empowering Communities</h3>
        <p>
          Our NGO initiatives bring education and essential resources to
          vulnerable populations worldwide.
        </p>
        <a
          href="https://sahashindia.org"
          className="learn-more"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn More
        </a>
      </div>
      <div className="content-block">
        <img
          src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/976dda56-f19c-4d78-b9b1-0797d0ccaf26.png"
          alt="Scientists in laboratory"
        />
        <h3>Exploring Scientific Frontiers</h3>
        <p>
          Supporting innovative research projects that advance human knowledge
          and wellbeing.
        </p>
        <a
          href="https://sahashindia.org"
          className="learn-more"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn More
        </a>
      </div>
      <div className="content-block">
        <img
          src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/b1012570-e703-40a2-a5cb-0eb072c274bf.png"
          alt="Teacher with children"
        />
        <h3>Inspiring The Next Generation</h3>
        <p>
          Creating hands-on educational experiences that spark curiosity and
          lifelong learning.
        </p>
        <a
          href="https://sahashindia.org"
          className="learn-more"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn More
        </a>
      </div>
    </div>
  </section>
);

const AboutUs = () => (
  <section id="aboutUs" aria-labelledby="aboutUs-heading">
    <div className="container">
      <h2 id="aboutUs-heading">About Us</h2>
      <div className="content-block">
        <h3>Our Vision</h3>
        <p>
          Nemo enim ipsam voluptatem, quia voluptas sit, aspernatur aut odit aut
          fugit, sed quia consequuntur magni dolores eos, qui ratione voluptatem
          sequi nesciunt, neque porro quisquam est, qui dolorem ipsum, quia
          dolor sit, amet, consectetur, adipisci velit, sed quia non numquam
          eius modi tempora incidunt, ut labore et dolore magnam aliquam quaerat
          voluptatem.{" "}
        </p>
        <a
          href="https://www.sahashindia.org/visionmission.html"
          className="learn-more"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn More
        </a>
      </div>
      <div className="content-block">
        <h3>Our Mission</h3>
        <p>
          Nemo enim ipsam voluptatem, quia voluptas sit, aspernatur aut odit aut
          fugit, sed quia consequuntur magni dolores eos, qui ratione voluptatem
          sequi nesciunt, neque porro quisquam est, qui dolorem ipsum, quia
          dolor sit, amet, consectetur, adipisci velit, sed quia non numquam
          eius modi tempora incidunt, ut labore et dolore magnam aliquam quaerat
          voluptatem.{" "}
        </p>
        <a
          href="https://www.sahashindia.org/visionmission.html"
          className="learn-more"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn More
        </a>
      </div>
      <div className="content-block">
        <h3>Our Values</h3>
        <p>
          Nemo enim ipsam voluptatem, quia voluptas sit, aspernatur aut odit aut
          fugit, sed quia consequuntur magni dolores eos, qui ratione voluptatem
          sequi nesciunt, neque porro quisquam est, qui dolorem ipsum, quia
          dolor sit, amet, consectetur, adipisci velit, sed quia non numquam
          eius modi tempora incidunt, ut labore et dolore magnam aliquam quaerat
          voluptatem.
        </p>
        <a
          href="https://www.sahashindia.org/visionmission.html"
          className="learn-more"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn More
        </a>
      </div>
    </div>
  </section>
);

const FeedbackForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill all fields.");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/feedbacks/feedback`,
        {
          name: name,
          email: email,
          feedback: message,
        },
      );

      if (response.data.success) {
        toast.success("Feedback submitted successfully");

        // Clear form
        setName("");
        setEmail("");
        setMessage("");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback ❌");
    }
  };

  return (
    <section
      id="feedback"
      aria-labelledby="feedback-heading"
      className="feedback-section"
    >
      <div className="container">
        <h2 id="feedback-heading">Share Your Feedback</h2>
        <div className="feedback-form-container">
          <form className="feedback-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="Name"
              required
            />
            <input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email"
              required
            />
            <textarea
              placeholder="Your Feedback"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              aria-label="Feedback message"
              rows="5"
              required
            ></textarea>
            <button className="btn-primary" onClick={handleSubmit} noValidate>
              Submit Feedback
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
const Home = ({ onLoginClick }) => {
  const [tests, setTests] = useState([]); // store data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axios = useAxios();
  const API_URL = process.env.REACT_APP_API_URL;

  // Fetch tests on mount
  useEffect(() => {
    axios
      .get(`${API_URL}/test/global-tests`)
      .then((response) => {
        const updatedTests = response.data.map((test) => ({
          ...test,
          pricing: test.test_fees > 0 ? "Paid" : "Free",
          fee: test.test_fees || 0,
        }));
        setTests(updatedTests);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  useEffect(() => {
    const targetId = sessionStorage.getItem("scrollTarget");
    if (!targetId) return;

    let attempts = 0;
    const tryScroll = () => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        sessionStorage.removeItem("scrollTarget"); // ek baar use ke baad clear kar do
      } else if (attempts < 20) {
        attempts++;
        setTimeout(tryScroll, 150);
      } else {
        sessionStorage.removeItem("scrollTarget");
      }
    };

    const timer = setTimeout(tryScroll, 350);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main role="main">
      <Hero tests={tests} />
      <Education />
      <Quiz tests={tests} />
      <HumanityScience />
      <AboutUs />
      <FeedbackForm />
    </main>
  );
};

export default Home;

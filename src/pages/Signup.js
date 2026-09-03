import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Select, { components } from "react-select";
import { FiEye, FiEyeOff, FiXCircle } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import { FaArrowLeft } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import "./css/Signup.css";

const CustomOption = (props) => {
  return (
    <components.Option {...props}>
      <input
        type="checkbox"
        checked={props.isSelected}
        disabled={props.isDisabled}
        readOnly
        style={{
          marginRight: "12px",
          accentColor: "#5B7CFA",
          cursor: props.isDisabled ? "not-allowed" : "pointer",
          opacity: props.isDisabled ? 0.5 : 1,
        }}
      />
      {props.label}
    </components.Option>
  );
};

const customStyles = {
  option: (base, state) => ({
    ...base,
    display: "flex",
    alignItems: "center",
    padding: "12px 16px",
    margin: "4px 8px",
    borderRadius: "10px",

    backgroundColor: state.isSelected
      ? "#E8F0FF" // selected light blue
      : state.isFocused
        ? "#F4F7FF" // hover color
        : "#fff",
    color: "#1F2937",
    cursor: "pointer",
    transition: "0.2s ease",
  }),

  control: (provided) => ({
    ...provided,
    minHeight: "52px",
    borderRadius: "12px",
    borderColor: "#D6E4FF",
    boxShadow: "none",
  }),

  multiValue: (provided) => ({
    ...provided,
    background: "#E8F0FF",
    borderRadius: "8px",
  }),

  multiValueLabel: (provided) => ({
    ...provided,
    color: "#374151",
    fontWeight: 500,
  }),

  multiValueRemove: (provided) => ({
    ...provided,
    color: "#374151",
    ":hover": {
      background: "#315EFB",
      color: "#fff",
    },
  }),
};

const SignUp = ({ onHomeClick }) => {
  const navigate = useNavigate();

  const [showOtpInfoDialog, setShowOtpInfoDialog] = useState(false);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [timer, setTimer] = useState(600); //10 min
  const [canResend, setCanResend] = useState(false);
  const [isInterestMenuOpen, setIsInterestMenuOpen] = useState(false);
  const [interestOptions, setInterestOptions] = useState([]);
  const [loadingInterests, setLoadingInterests] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [signupUserType, setSignupUserType] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    gender: "",
    mobile: "",
    email: "",
    fathername: null,
    interest: [],
    designation: null,
    password: "",
    confirmPassword: "",
    institutionType: null,
    institutionState: "",
    institutionDistrict: "",
    institutionName: "",
    standard: "",
    course: "",
    exam: "",
    userType: "",
  });

  const [genderDropdown, setGenderDropdown] = useState("");
  const [institutionType, setInstitutionType] = useState("");
  const [message, setMessage] = useState("");
  const [institutes, setInstitutes] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [showDialog, setShowDialog] = useState(false); // for success popup
  const debounceTimeout = useRef(null); // to hold the timeout ID
  const [districtsData, setDistrictsData] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(formData.email);
  const [errors, setErrors] = useState({}); //to handle the errors in form
  const [passwordValid, setPasswordValid] = useState(null);
  const [passwordMatch, setPasswordMatch] = useState(null);
  //for otp verification...
  const [openVerifyDialog, setOpenVerifyDialog] = useState(false);

  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);

  const [emailVerified, setEmailVerified] = useState(false);

  const [otpError, setOtpError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [standardData, setStandardData] = useState(null);

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
    const uniqueStates = [...new Set(districtsData.map((item) => item.state))];
    setStates(uniqueStates);
  }, []);

  useEffect(() => {
    if (formData.username.trim() === "" || formData.username === "") {
      setUsernameAvailable(null);
      return;
    }
    // Debounce the API call
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      axios
        .get(`${API_URL}/auth/checkUsername`, {
          params: { username: formData.username },
        })
        .then((response) => {
          setUsernameAvailable(response.data.available);
        })
        .catch((error) => {
          console.error("Error checking username:", error);
          setUsernameAvailable(null);
        });
    }, 500); // 500ms debounce
  }, [formData.username]);

  useEffect(() => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{6,}$/;

    if (!formData.password) {
      setPasswordValid(null);
      setPasswordMatch(null);
    } else {
      setPasswordValid(passwordRegex.test(formData.password));
    }

    if (!formData.confirmPassword) {
      setPasswordMatch(null);
    } else {
      setPasswordMatch(formData.password === formData.confirmPassword);
    }
  }, [formData.password, formData.confirmPassword]);

  useEffect(() => {
    fetchInterests();
  }, []);

  const fetchInterests = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/get-interest`);

      if (res.data.success) {
        const options = res.data.data.map((item) => ({
          value: item.interest_id,
          label: item.interest_name,
        }));

        setInterestOptions(options);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInterests();
  }, []);

  const handleStateChange = (e) => {
    console.log("Available States:", states);

    const selectedState = e.target.value;
    const filteredDistricts = districtsData
      .filter((item) => item.state === selectedState)
      .map((item) => item.district);
    const uniqueDistricts = [...new Set(filteredDistricts)];
    setDistricts(uniqueDistricts);

    setFormData((prev) => ({
      ...prev,
      institutionState: selectedState,
      institutionDistrict: "",
      institutionName: "",
    }));
  };

  const handleDistrictChange = (e) => {
    const selectedDistrict = e.target.value;
    setFormData((prev) => ({
      ...prev,
      institutionDistrict: selectedDistrict,
      institutionName: "",
    }));

    if (
      formData.institutionType &&
      formData.institutionState &&
      selectedDistrict
    ) {
      fetchInstitutions(
        formData.institutionType,
        formData.institutionState,
        selectedDistrict,
      );
    }
  };

  const fetchInstitutions = async (type, state, city) => {
    try {
      const response = await axios.get(`${API_URL}/institute/institutions`, {
        params: { type, state, city },
      });

      const instituteData = response.data.data;

      const sortedInstitutes = instituteData.sort((a, b) =>
        a.institute_name.localeCompare(b.institute_name, "en", {
          sensitivity: "base",
        }),
      );
      setInstitutes(sortedInstitutes);
    } catch (error) {
      console.error("Error fetching institutions:", error);
    }
  };

  const handleInstitutionType = (e) => {
    const selectedType = e.target.value;
    setInstitutionType(selectedType);
    setFormData((prev) => ({
      ...prev,
      institutionType: selectedType,
      institutionState: "",
      institutionCity: "",
      institutionName: "",
      standard: "",
      course: "",
      exam: "",
    }));
  };

  const closeDialog = () => {
    setShowDialog(false);
    navigate("/login"); // Redirect to login after closing dialog
  };

  const fetchStandards = async (instituteId) => {
    try {
      const response = await axios.get(
        `${API_URL}/institute/standards/${instituteId}`,
      );

      console.log("StandardData", response.data);

      setStandardData(response.data);
    } catch (error) {
      console.error("Error fetching standards:", error);
      setStandardData([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile") {
      let phone = value.replace(/\D/g, "");

      if (phone.length > 10) phone = phone.slice(0, 10);

      setFormData((prev) => ({
        ...prev,
        mobile: phone,
      }));

      return;
    }

    if (name === "password") {
      setFormData((prev) => ({
        ...prev,
        password: value,
        confirmPassword: "",
      }));

      return;
    }

    if (name === "institutionName") {
      // Find the selected institution
      const selectedInstitute = institutes.find(
        (inst) => inst.institute_name === value,
      );

      if (selectedInstitute) {
        // Save institute_id in formData
        setFormData((prev) => ({
          ...prev,
          institutionName: value,
          institute_id: selectedInstitute.institute_id,
          standard_type: "",
        }));

        // Fetch standards using institute_id
        fetchStandards(selectedInstitute.institute_id);
      } else {
        setStandardData([]);
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInterestChange = (interest) => {
    let updatedInterests;

    if (formData.interest.includes(interest)) {
      updatedInterests = formData.interest.filter((item) => item !== interest);
    } else {
      if (formData.interest.length >= 5) return;

      updatedInterests = [...formData.interest, interest];
    }

    setFormData((prev) => ({
      ...prev,
      interest: updatedInterests,
    }));
  };

  useEffect(() => {
    if (!showOtpDialog) return;

    if (timer <= 0) {
      setCanResend(true);

      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, showOtpDialog]);

  const sendOtp = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/send-email-otp`, {
        email: formData.email,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setShowOtpDialog(true);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Unable to send OTP. Please try again.",
      );
    }
  };

  const verifyOtp = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/verify-email-otp`, {
        email: formData.email,
        otp: otp,
      });

      if (res.data.success) {
        toast.success(res.data.message);

        setShowOtpDialog(false);
        setIsEmailVerified(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP verification failed.");
    }
  };
  //to resend the otp
  const resendOtp = async () => {
    setTimer(600);
    setCanResend(false);
    setOtp("");
    setOtpError("");

    await sendOtp();
  };

  //for hadnling the form validation before submission
  const validateForm = () => {
    let newErrors = {};

    // Name
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    // Username
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (usernameAvailable === false) {
      newErrors.username = "Username already taken";
    }

    // Email
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Mobile
    if (!formData.mobile) {
      newErrors.mobile = "Mobile number required";
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      newErrors.mobile = "Enter valid 10-digit number";
    }

    // Password
    if (!formData.password) {
      newErrors.password = "Password required";
    } else if (
      !/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{6,}$/.test(formData.password)
    ) {
      newErrors.password = "Min 6 chars, 1 uppercase, 1 lowercase, 1 number";
    }

    // Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // User Type
    if (!formData.userType) {
      newErrors.userType = "Select user type";
    }

    if (formData.userType !== "Teacher") {
      if (formData.interest.length === 0) {
        newErrors.interest = "Please select at least one interest";
      }
    }
    // Institution validation (important logic)
    if (formData.userType !== "Others") {
      if (!formData.institutionType) {
        newErrors.institutionType = "Select institution type";
      }
      if (!formData.institutionState) {
        newErrors.institutionState = "Select state";
      }
      if (!formData.institutionDistrict) {
        newErrors.institutionDistrict = "Select district";
      }
      if (!formData.institutionName) {
        newErrors.institutionName = "Select institution";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm() || !passwordValid || !passwordMatch) {
      console.log("validation failed");
      return;
    }
    if (!isEmailVerified) {
      toast.warning("Please verify your email first.");
      return;
    }
    // Determine standard_type based on institution type
    let standard_type = "";
    if (institutionType === "School") {
      standard_type = formData.standard;
    } else if (
      institutionType === "College" ||
      institutionType === "University"
    ) {
      standard_type = formData.course;
    } else if (institutionType === "Coaching Center") {
      standard_type = formData.exam;
    } else {
      standard_type = formData.qualification;
    }

    // let role_id = undefined;
    // if (name === 3) role_ = "Teacher";
    // else if (name === "4" || name === "5") role_name = "Student";

    const finalData = {
      name: formData.name,
      username: formData.username,
      gender: formData.gender,
      mobile: formData.mobile,
      email: formData.email,
      designation: formData.designation,
      interests: formData.interest,
      state: null,
      password: formData.password,
      //confirmPassword: formData.confirmPassword,
      userType: formData.userType,
      institutionType: formData.institutionType,
      institutionState: formData.institutionState,
      institutionCity: formData.institutionDistrict,
      institutionName: formData.institutionName,
      fathername: formData.fathername,
      standard_type: standard_type,
    };

    console.log(finalData);

    try {
      const response = await axios.post(`${API_URL}/auth/add-user`, finalData);
      if (response.data.success) {

        // Save user type for dialog
        setSignupUserType(formData.userType);

        setMessage(response.data.message);
        console.log("User registered successfully!");

        setShowDialog(true); // show success dialog

        setFormData({
          name: "",
          username: "",
          gender: "",
          mobile: "",
          email: "",
          fathername: null,
          interest: [],
          password: "",
          confirmPassword: "",
          institutionType: null,
          institutionState: "",
          institutionDistrict: "",
          institutionName: "",
          standard: "",
          course: "",
          exam: "",
          userType: "",
        });
      } else {
        setMessage(response.data.message);
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Signup Error:", error);

      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Data:", error.response.data);

        toast.error(error.response.data.message);
      } else {
        toast.error("Server not reachable");
      }
    }
  };

  // for areas of interest
  useEffect(() => {
    console.log(formData.interest);
  }, [formData.interest]);

  //to back to home page ..
  const handleBackClick = () => {
    //onHomeClick();
    navigate("/");
  };

  const interests = [
    "Mathematics",
    "Science",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science / Coding",
    "English Literature",
    "Social Studies / History",
    "Economics",
    "Geography",
    "Robotics / AI",
    "Environmental Awareness",
    "Space / Astronomy",
    "Arts",
  ];

  // const interestOptions = interests.map((item) => ({
  //   value: item,
  //   label: item,
  // }));

  const resetForm = (userType) => {
    setFormData((prev) => ({
      ...Object.fromEntries(Object.keys(prev).map((key) => [key, ""])),
      userType,
      fathername: null,
      interest: [],
      institutionType: null,
    }));
    setGenderDropdown("");
    setInstitutionType("");
    setInstitutes([]);
    setDistricts([]);
  };

  return (
    <>
      <div className="signup-back">
        <button
          type="button"
          className="back-btn"
          onClick={() => navigate("/login")}
        >
          <FaArrowLeft />
          <span>Back</span>
        </button>
      </div>

      <div className="body">
        <div className="bg-animation">
          <div className="circle"></div>
          <div className="circle"></div>
          <div className="circle"></div>
          <div className="circle"></div>
          <div className="circle"></div>
        </div>
        {/* {showSuccess && (
        <div className="success-message show">Sign Up Successful!</div>
      )} */}

        <div className="signup-container">
          <h2>Sign Up</h2>
          <form onSubmit={handleSubmit} autoComplete="off">
            {/**For Selecting User Type*/}
            <fieldset className="form-section-sign">
              <legend>User Type</legend>
              <div className="form-row-sign">
                <div className="form-group-sign radio-group">
                  <label className="radio-label">Select User Type</label>
                  <div className="radio-options">
                    <label>
                      <input
                        type="radio"
                        name="userType"
                        value="Student"
                        checked={formData.userType === "Student"}
                        onClick={(e) => resetForm(e.target.value)}
                      />
                      Student
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="userType"
                        value="Teacher"
                        checked={formData.userType === "Teacher"}
                        onChange={(e) => resetForm(e.target.value)}
                      />
                      Teacher
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="userType"
                        value="Others"
                        checked={formData.userType === "Others"}
                        onClick={(e) => resetForm(e.target.value)}
                      />
                      Others
                    </label>
                  </div>
                </div>
              </div>
            </fieldset>

            {/** Personal Details*/}
            {formData.userType && (
              <fieldset className="form-section-sign">
                <legend>Personal Details</legend>
                <div className="form-row-sign">
                  <div className="form-group-sign">
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Full Name "
                      value={formData.name}
                      onChange={handleChange}
                    />
                    {errors.name && <p className="error">{errors.name}</p>}
                    <label htmlFor="fullname"></label>
                  </div>
                  {(formData.userType === "Student" ||
                    formData.userType === "Others") && (
                      <div className="form-group-sign">
                        <input
                          type="text"
                          name="fathername"
                          required
                          placeholder="Father's Name "
                          value={formData.fathername}
                          onChange={handleChange}
                        />
                        <label htmlFor="fathername"></label>
                      </div>
                    )}

                  {formData.userType === "Teacher" && (
                    <div className="form-group-sign">
                      <input
                        type="text"
                        name="designation"
                        required
                        placeholder="Designation"
                        value={formData.designation}
                        onChange={handleChange}
                      />
                      <label htmlFor="designation"></label>
                    </div>
                  )}
                </div>

                <div className="form-row-sign">
                  <div className="form-group-sign">
                    <select
                      value={genderDropdown}
                      onChange={(e) => {
                        const selected = e.target.value;
                        setGenderDropdown(selected);
                        setFormData((prev) => ({
                          ...prev,
                          gender: selected === "Others" ? "" : selected,
                        }));
                      }}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                  {genderDropdown === "Others" && (
                    <div className="form-group-sign">
                      <input
                        type="text"
                        name="gender"
                        required
                        placeholder="Specific Gender"
                        value={formData.gender}
                        onChange={handleChange}
                      />
                      <label htmlFor="customGender"></label>
                    </div>
                  )}
                </div>
                {(formData.userType === "Student" ||
                  formData.userType === "Others") && (
                    <div className="form-row-sign">
                      <div className="form-group-sign">
                        {isInterestMenuOpen && (
                          <p className="info-text">
                            Maximum 5 selections allowed
                          </p>
                        )}

                        <Select
                          isLoading={loadingInterests}
                          isMulti
                          components={{ Option: CustomOption }}
                          styles={customStyles}
                          closeMenuOnSelect={false}
                          hideSelectedOptions={false}
                          onMenuOpen={() => setIsInterestMenuOpen(true)}
                          onMenuClose={() => setIsInterestMenuOpen(false)}
                          blurInputOnSelect={false}
                          isSearchable={false}
                          placeholder="Area of Interest"
                          options={interestOptions.map((option) => ({
                            ...option,
                            isDisabled:
                              formData.interest.length >= 5 &&
                              !formData.interest.includes(option.value),
                          }))}
                          value={interestOptions.filter((option) =>
                            formData.interest.includes(option.value),
                          )}
                          onChange={(selected) => {
                            if (!selected) {
                              setFormData((prev) => ({
                                ...prev,
                                interest: [],
                              }));
                              return;
                            }

                            if (selected.length > 5) return;

                            setFormData((prev) => ({
                              ...prev,
                              interest: selected.map((item) => item.value),
                            }));
                          }}
                        />

                        {errors.interest && (
                          <p className="error">{errors.interest}</p>
                        )}
                      </div>
                    </div>
                  )}
              </fieldset>
            )}

            {/**Contact details */}
            {formData.userType && (
              <fieldset className="form-section-sign">
                <legend>Contact Details</legend>
                <div className="form-row-sign">
                  <div className="form-group-sign">
                    <div className="email-verify-container">
                      <input
                        type="email"
                        name="email"
                        required
                        autoComplete="off"
                        placeholder="Email"
                        value={formData.email}
                        disabled={isEmailVerified}
                        onChange={handleChange}
                      />
                      {formData.email && !isEmailVerified ? (
                        <button
                          type="button"
                          className="btn-email-verify"
                          disabled={!isEmailValid}
                          title={
                            !isEmailValid
                              ? "Please enter a valid email address (example: user@example.com)"
                              : ""
                          }
                          onClick={async () => {
                            if (!isEmailValid) {
                              toast.warning(
                                "Please enter a valid email address (e.g. user@example.com) before verification.",
                              );
                              return;
                            }

                            await sendOtp();
                          }}
                        >
                          Verify
                        </button>
                      ) : isEmailVerified ? (
                        <span className="email-verified">✓ Verified</span>
                      ) : null}
                      {errors.email && <p className="error">{errors.email}</p>}
                      <label htmlFor="email"></label>
                    </div>
                  </div>
                  {/** email verification dialog box  **/}

                  <div className="form-row-sign">
                    <div className="form-group-sign">
                      <input
                        type="tel"
                        name="mobile"
                        required
                        placeholder="Mobile Number "
                        value={formData.mobile}
                        onChange={handleChange}
                        maxLength={10}
                        inputMode="numeric"
                      />
                      {errors.mobile && (
                        <p className="error">{errors.mobile}</p>
                      )}

                      <label htmlFor="phoneNumber"></label>
                    </div>
                  </div>
                </div>
              </fieldset>
            )}

            {/** Institutional/Educational Details*/}
            {(formData.userType === "Student" ||
              formData.userType === "Teacher") && (
                <fieldset className="form-section-sign">
                  <legend>
                    {formData.userType === "Student"
                      ? "Educational Details"
                      : "Institutional Details"}
                  </legend>
                  <div className="form-row-sign">
                    <div className="form-group-sign">
                      <select
                        name="institutionType"
                        value={formData.institutionType}
                        onChange={handleInstitutionType}
                      >
                        <option value="">Institution Type</option>
                        <option value="School">School</option>
                        <option value="College">College</option>
                        <option value="University">University</option>
                        <option value="Coaching Center">Coaching Center</option>
                      </select>
                      <label htmlFor="institutionType"></label>
                    </div>

                    <div className="form-group-sign">
                      <select
                        name="institutionState"
                        required
                        value={formData.institutionState}
                        onChange={handleStateChange}
                        disabled={!formData.institutionType}
                      >
                        <option value="" disabled hidden>
                          Institution State
                        </option>
                        {states.map((state, idx) => (
                          <option key={idx} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                      <label htmlFor="institutionState"></label>
                    </div>
                  </div>
                  <div className="form-row-sign">
                    <div className="form-group-sign">
                      <select
                        name="institutionDistrict"
                        value={formData.institutionDistrict}
                        onChange={handleDistrictChange}
                        disabled={!formData.institutionState}
                      >
                        <option value="" disabled selected hidden>
                          Institution District
                        </option>
                        {districts.map((dist, idx) => (
                          <option key={idx} value={dist}>
                            {dist}
                          </option>
                        ))}
                      </select>
                      <label htmlFor="institutionDistrict"></label>
                    </div>
                  </div>

                  <div className="form-row-sign">
                    <div className="form-group-sign">
                      <select
                        name="institutionName"
                        value={formData.institutionName}
                        onChange={handleChange}
                        required
                      >
                        <option value=""> Institution Name </option>
                        {institutes.map((inst, idx) => (
                          <option key={idx} value={inst.institute_name}>
                            {inst.institute_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {formData.userType !== "Teacher" && (
                    <div className="form-row-sign">
                      <div className="form-group-sign">
                        {formData.institutionType && (
                          <select
                            name={
                              formData.institutionType === "School"
                                ? "standard"
                                : formData.institutionType === "Coaching Center"
                                  ? "exam"
                                  : "course"
                            }
                            value={
                              formData.institutionType === "School"
                                ? formData.standard
                                : formData.institutionType === "Coaching Center"
                                  ? formData.exam
                                  : formData.course
                            }
                            onChange={handleChange}
                          >
                            <option value="">
                              Select{" "}
                              {formData.institutionType === "School"
                                ? "Standard"
                                : formData.institutionType === "Coaching Center"
                                  ? "Exam"
                                  : "Course"}
                            </option>

                            {standardData?.map((item) => (
                              <option
                                key={item.standard_id}
                                value={item.item_name}
                              >
                                {item.item_name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  )}
                </fieldset>
              )}
            {/** Account Details*/}
            {formData.userType && (
              <fieldset className="form-section-sign">
                <legend>Account Details</legend>
                <div className="form-row-sign">
                  <div className="form-group-sign">
                    <div className="under-para-avail">
                      <input
                        type="text"
                        name="username"
                        required
                        placeholder=" Username"
                        value={formData.username}
                        onChange={handleChange}
                      />
                      {errors.username && (
                        <p className="error">{errors.username}</p>
                      )}
                      <label htmlFor="username"></label>
                    </div>
                    {/* <div className="form-group">
                   
                </div>    */}

                    {/* Feedback Message */}
                    {formData.username.trim() !== "" &&
                      usernameAvailable === true && (
                        <p style={{ color: "green", marginTop: "10px" }}>
                          ✅ Username is available
                        </p>
                      )}
                    {formData.username.trim() !== "" &&
                      usernameAvailable === false && (
                        <p style={{ color: "red", marginTop: "10px" }}>
                          ❌ Username is already taken
                        </p>
                      )}
                  </div>
                </div>
                <div className="form-row-sign">
                  <div className="form-group-sign">
                    <div className="password-input-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        autoComplete="new-password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={usernameAvailable === false}
                        className="password-input"
                      />

                      {formData.password && (
                        <>
                          <FiXCircle
                            className="password-icon clear-icon"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                password: "",
                                confirmPassword: "",
                              }))
                            }
                          />

                          <span
                            className="password-icon eye-icon"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <FiEyeOff /> : <FiEye />}
                          </span>
                        </>
                      )}
                    </div>

                    {passwordValid === false && (
                      <p className="error-text">
                        ❌ Min 6 chars, 1 uppercase, 1 lowercase, 1 number
                      </p>
                    )}

                    {passwordValid === true && (
                      <p className="success-text">✅ Strong password</p>
                    )}
                    <label htmlFor="password"></label>
                  </div>

                  <div className="form-group-sign">
                    <div className="password-input-wrapper">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        autoComplete="new-password"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        disabled={!passwordValid}
                        className="password-input"
                      />

                      {formData.confirmPassword && (
                        <>
                          <FiXCircle
                            className="password-icon clear-icon"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                confirmPassword: "",
                              }))
                            }
                          />

                          <span
                            className="password-icon eye-icon"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                          </span>
                        </>
                      )}
                    </div>

                    {passwordMatch === false && (
                      <p className="error-text">❌ Passwords do not match</p>
                    )}

                    {passwordMatch === true && (
                      <p className="success-text">✅ Passwords match</p>
                    )}
                    <label htmlFor="confirmPassword"> </label>
                  </div>
                </div>
              </fieldset>
            )}
            {/**Button section */}
            <div className="button-container">
              <button
                type="submit"
                className="Signup-btn"
                disabled={!formData.userType}
              >
                Sign Up
              </button>
              {/********************************************************************fdj */}
              <button
                type="button"
                className="back-btn"
                onClick={handleBackClick}
              >
                Back to Home
              </button>
            </div>
          </form>
        </div>

        {showOtpInfoDialog && (
          <div className="otp-info-overlay">
            <div className="otp-info-card">
              <div className="otp-info-icon">📧</div>

              <h2>Email Verification</h2>

              <p className="otp-info-text">
                We've sent a One-Time Password (OTP) to your registered email
                address.
              </p>

              <div className="otp-email-box">{formData.email}</div>

              <div className="otp-note">
                ⏳ OTP will expire in <b>10 minutes</b>.
              </div>

              <button
                className="otp-info-btn"
                onClick={() => {
                  setShowOtpInfoDialog(false);
                  setShowOtpDialog(true);
                  setTimer(600);
                  setCanResend(false);
                }}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Custom Success Dialog */}
        {showDialog && (
          <div className="dialog-overlay">
            <div className="dialog-box">
              <h3>✅ Signup Successful!</h3>
              <br />

              <p>
                {signupUserType === "Teacher"
                  ? "Sign up request sent successfully. Remember your credentials for login after successful login approval."
                  : "Your account has been created successfully."}
              </p>

              <button onClick={closeDialog}>OK</button>
            </div>
          </div>
        )}

        {showOtpDialog && (
          <div className="otp-overlay">
            <div className="otp-card">
              <button
                className="otp-close"
                onClick={() => setShowOtpDialog(false)}
              >
                ✕
              </button>

              <div className="otp-icon">📧</div>

              <h2>Email Verification</h2>

              <p className="otp-text">We've sent a verification code to</p>

              <p className="otp-email">{formData.email}</p>

              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="otp-input-modern"
              />

              <div className="otp-time">
                ⏱ {Math.floor(timer / 60)}:
                {(timer % 60).toString().padStart(2, "0")}
              </div>

              {otpError && <p className="otp-error-modern">{otpError}</p>}

              <button
                className="verify-btn-modern"
                disabled={otp.length !== 6}
                onClick={verifyOtp}
              >
                Verify OTP
              </button>

              <button
                className="resend-link"
                onClick={resendOtp}
                disabled={!canResend}
              >
                {canResend ? "Resend OTP" : "Resend available after timer"}
              </button>
            </div>
          </div>
        )}

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="colored"
        />
      </div>
    </>
  );
};

export default SignUp;

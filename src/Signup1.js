import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import districtsData from "./res/district.json";
import "./pages/css/Signup.css";

const SignupForm = () => {
  const { id } = useParams();
  const roleId = parseInt(id);
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    mobile: "",
    email: "",
    fathername: null,
    interest:null,
    password: "",
    confirmPassword: "",
    institutionType: null,
    institutionState: "",
    institutionCity: "",
    institutionName: "",
    standard: "",
    course: "",
    exam: "",
  });

  const [genderDropdown, setGenderDropdown] = useState("");
  const [institutionType, setInstitutionType] = useState("");
  const [message, setMessage] = useState("");
  const [institutes, setInstitutes] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    const uniqueStates = [...new Set(districtsData.map((item) => item.state))];
    setStates(uniqueStates);
  }, []);

  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    const filteredDistricts = districtsData
      .filter((item) => item.state === selectedState)
      .map((item) => item.district);
    const uniqueDistricts = [...new Set(filteredDistricts)];
    setDistricts(uniqueDistricts);

    setFormData((prev) => ({
      ...prev,
      institutionState: selectedState,
      institutionCity: "",
      institutionName: "",
    }));
  };

  const handleDistrictChange = (e) => {
    const selectedCity = e.target.value;
    setFormData((prev) => ({
      ...prev,
      institutionCity: selectedCity,
      institutionName: "",
    }));

    if (
      formData.institutionType &&
      formData.institutionState &&
      selectedCity
    ) {
      fetchInstitutions(
        formData.institutionType,
        formData.institutionState,
        selectedCity
      );
    }
  };

  const fetchInstitutions = async (type, state, city) => {
    try {
      const response = await axios.get("http://localhost:5000/institutions", {
        params: { type, state, city },
      });
      const sortedInstitutes = response.data.sort((a, b) =>
        a.institute_name.localeCompare(b.institute_name, "en", {
          sensitivity: "base",
        })
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Determine standard_type based on institution type
    let standard_type = "";
    if (institutionType === "School") {
      standard_type = formData.standard;
    } else if (institutionType === "College" || institutionType === "University") {
      standard_type = formData.course;
    } else if (institutionType === "Coaching") {
      standard_type = formData.exam;
    }

    // let role_id = undefined;
    // if (id === 3) role_ = "Teacher";
    // else if (id === "4" || id === "5") role_name = "Student";

    const finalData = {
      name: formData.name,
      gender: formData.gender,
      mobile: formData.mobile,
      email: formData.email,
      designation:null,
      interest: formData.interest,
      state:null,
      password: formData.password, 
      role_id: roleId,
      institutionType: formData.institutionType,
      institutionState: formData.institutionState,
      institutionCity: formData.institutionCity,
      institutionName: formData.institutionName,
      fathername: formData.fathername,
      standard_type: standard_type,
      
    };

    console.log(finalData);
    
    try {
      const response = await axios.post("http://localhost:5000/add-user", finalData);
      if (response.status === 200) {
        setMessage("User registered successfully!");
      } else {
        setMessage("Registration failed.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Error connecting to server.");
    }
  };

  return (
    <div className="form-container">
      {roleId === 3 && <h2>Teacher Sign Up</h2>}
      {roleId === 4 && <h2>Student Sign Up</h2>}
      {message && <p className="message">{message}</p>}

      <form onSubmit={handleSubmit} className="signup-form">
        <label>Name
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </label>

        <label>Father's Name
          <input type="text" name="fathername" value={formData.fathername} onChange={handleChange} required />
        </label>

        <label>Gender
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
        </label>

        {genderDropdown === "Others" && (
          <label>Please specify your gender
            <input
              type="text"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              placeholder="Enter your gender identity"
              required
            />
          </label>
        )}

        <label>Mobile
          <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} required />
        </label>

        <label>Email
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </label>

        <label>Interest
          <select name="interest" value={formData.interest} onChange={handleChange} required>
            <option value="">Select Interest</option>
            <option value="Commerce">Commerce</option>
            <option value="Arts">Arts</option>
            <option value="Environment Awareness">Environment Awareness</option>
          </select>
        </label>

        {(roleId === 3 || roleId === 4) && (
          <>
            <label>Institution Type
              <select value={institutionType} onChange={handleInstitutionType} required>
                <option value="">Select Institution Type</option>
                <option value="School">School</option>
                <option value="College">College</option>
                <option value="University">University</option>
                <option value="Coaching">Coaching</option>
              </select>
            </label>

            {institutionType === "School" && (
              <label>Standard
                <select name="standard" value={formData.standard} onChange={handleChange}>
                  <option value="">Select Standard</option>
                  {[1, 2, 3, 4].map((std) => (
                    <option key={std} value={std}>{std}</option>
                  ))}
                </select>
              </label>
            )}

            {(institutionType === "College" || institutionType === "University") && (
              <label>Course
                <select name="course" value={formData.course} onChange={handleChange}>
                  <option value="">Select Course</option>
                  {["BCA", "MCA", "BSc", "MSc"].map((course) => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </label>
            )}

            {institutionType === "Coaching" && (
              <label>Exam
                <select name="exam" value={formData.exam} onChange={handleChange}>
                  <option value="">Select Exam</option>
                  {["JEE", "NEET", "UPSC", "SSC"].map((exam) => (
                    <option key={exam} value={exam}>{exam}</option>
                  ))}
                </select>
              </label>
            )}

            <label>Institution State
              <select name="institutionState" onChange={handleStateChange} value={formData.institutionState} required>
                <option value="">-- Select State --</option>
                {states.map((state, idx) => (
                  <option key={idx} value={state}>{state}</option>
                ))}
              </select>
            </label>

            <label>Institution City
              <select name="institutionCity" onChange={handleDistrictChange} value={formData.institutionCity} required>
                <option value="">-- Select City --</option>
                {districts.map((dist, idx) => (
                  <option key={idx} value={dist}>{dist}</option>
                ))}
              </select>
            </label>

            <label>Institution Name
              <select name="institutionName" value={formData.institutionName} onChange={handleChange} required>
                <option value="">-- Select Institution --</option>
                {institutes.map((inst, idx) => (
                  <option key={idx} value={inst.institute_name}>{inst.institute_name}</option>
                ))}
              </select>
            </label>
          </>
        )}

        <label>Password
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </label>

        <label>Confirm Password
          <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
        </label>

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default SignupForm;

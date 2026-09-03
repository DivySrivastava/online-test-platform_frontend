import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./css/InstituteRegistration.css";

const InstituteRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    state: "",
    district: "",
    instituteType: "",
  });

  // filter values
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [districtsData, setDistrictsData] = useState([]);
  const [showDialog, setShowDialog] = useState(false); // for success popup
  const API_URL = process.env.REACT_APP_API_URL;

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
      state: selectedState,
      district: "",
      instituteType: "",
    }));
  };

  const handleDistrictChange = (e) => {
    const selectedDistrict = e.target.value;
    setFormData((prev) => ({
      ...prev,
      district: selectedDistrict,
    }));
  };

  const handleInstitutionType = (e) => {
    const selectedType = e.target.value;
    // setInstitutionType(selectedType);
    setFormData((prev) => ({
      ...prev,
      instituteType: selectedType,
    }));
  };

  function changeHandler(event) {
    setFormData((prevData) => {
      return {
        ...prevData,
        [event.target.name]: event.target.value,
      };
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${API_URL}/institute/add-institution`,
        formData,
      );

      console.log("Success:", response.data);

      // ✅ Show success dialog
      setShowDialog(true);

      // ✅ Reset form
      setFormData({
        name: "",
        state: "",
        district: "",
        instituteType: "",
        // add all fields here
      });
    } catch (error) {
      console.error("Error:", error);

      if (error.response) {
        // ✅ Backend error
        alert(error.response.data.message || "Something went wrong");
      } else {
        // ✅ Network error
        alert("Server not reachable");
      }
    }
  };

  return (
    <div className="wrapper-institute-regis">
      <div className="registration-div">
        <h1>Institute Registration</h1>
        <div className="institute-logo-container">
          <img
            src={"/images/school.png"}
            alt="add-institute"
            className="img-institute"
          />
        </div>
      </div>

      <div className="form-container-institute-regis">
        <div className="form-container-div-institute-regis">
          <form onSubmit={handleSubmit} className="form-institute-regis">
            <input
              required
              type="text"
              value={formData.name}
              onChange={changeHandler}
              name="name"
              placeholder="Name"
            />
            <br></br>

            <select
              name="state"
              value={formData.state}
              onChange={handleStateChange}
            >
              <option value="" disabled>
                State
              </option>
              {states.map((state, idx) => (
                <option key={idx} value={state}>
                  {state}
                </option>
              ))}
            </select>
            <br></br>

            <select
              name="district"
              value={formData.district}
              onChange={handleDistrictChange}
            >
              <option value="" disabled>
                District
              </option>

              {districts.map((dist, idx) => (
                <option key={idx} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
            <br></br>

            <select
              name="instituteType"
              value={formData.instituteType}
              onChange={handleInstitutionType}
            >
              <option value="" disabled>
                Institute Type
              </option>
              <option value="School">School</option>
              <option value="College">College</option>
              <option value="University">University</option>
              <option value="Coaching">Coaching</option>
            </select>

            <div className="institute-regis-btn-row">
              <button
                type="button"
                className="btn-institute-regis-back"
                onClick={() => navigate("/dashboard/manageinstitutes")}
              >
                Back
              </button>
              <button className="btn-institute-regis">Submit</button>
            </div>
          </form>

          {showDialog && (
            <div className="institute-success-popup">
              <p>✅ Institution Registered Successfully!</p>
              <button onClick={() => setShowDialog(false)}>OK</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstituteRegistration;

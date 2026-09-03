import React, { useState, useEffect, useRef, useContext } from "react";
import "./css/FullTestDetails.css";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAxios } from "../api/axiosInstance";
import { UserContext } from "../contexts/UserContext";
import { toast } from "react-toastify";
import ReactDOM from "react-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from "@mui/material";

const FullTestDetails = () => {
  const { test_id } = useParams();
  const axios = useAxios();
  const [test, setTest] = useState(null);
  const [initialFormData, setInitialFormData] = useState({});
  const [originalFormData, setOriginalFormData] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [logoUploaded, setLogoUploaded] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [previewType, setPreviewType] = useState(null);
  const [scheduleResultRelease, setScheduleResultRelease] = useState(null);
  const [scheduleResultDate, setScheduleResultDate] = useState(null);
  const [interests, setInterests] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL;
  const fileInputRef = useRef();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const roleMap = {
    1: "Super Admin",
    2: "Admin",
    3: "Teacher",
  };

  //const [creatorData, setCreatorData] = useState(null);

  const [instituteData, setInstituteData] = useState({
    instituteType: "",
    instituteName: "",
  });

  const [pricing, setPricing] = useState("");

  const [formData, setFormData] = useState({
    test_name: "",
    test_description: "",
    test_type: "",
    testVisibility: "",
    creatorID: "",
    start_date: "",
    end_date: "",
    created_at: "",
    result_date: "",
    test_fees: 0,
    interest_id: 0,
    test_duration: 0,
    passing_marks: 0,
    maxMarks: 0,
    institution: "",
    standard: "",
    totalCandidates: 0,
    resultDeclared: "No",
    testLanguage: "",
    testLogo: null,
  });

  function getUpdatedFields(formData) {
    const updatedFields = {};
    for (const key in formData) {
      if (formData[key] !== originalFormData[key]) {
        updatedFields[key] = formData[key];
      }
    }
    return updatedFields;
  }

  const handleShowPreview = async (preview_type) => {
    setPreviewType(preview_type);
    const formData = new FormData();
    formData.append("logo", logoFile);

    const endpoint =
      preview_type === "report" ? "/preview-report" : "/preview-certificate";

    try {
      const res = await fetch(`${API_URL}/cert-repo${endpoint}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to fetch PDF preview");
      }

      const blob = await res.blob(); // ✅ Correct usage for fetch
      const previewUrl = URL.createObjectURL(blob);
      setPreviewUrl(previewUrl);
      setShowDialog(true);
    } catch (err) {
      console.error("Preview error:", err);
    }
  };

  const standardLabelMap = {
    School: "Standard",
    College: "Course",
    University: "Course",
    Coaching: "Exam",
  };

  const standardLabel =
    standardLabelMap[instituteData?.instituteType] || "Standard/Course/Exam";

  const [creatorData, setCreatorData] = useState({
    creatorRole: "",
    creatorName: "",
  });

  const handleCloseDialog = () => setShowDialog(false);

  const handleCancelUpload = () => {
    setLogoFile(null);
    setLogoUploaded(false);
    fileInputRef.current.value = null; // Reset input field
  };

  const fetchTestAndCreator = async () => {
    try {
      // 1. Fetch test details
      const testResponse = await axios.get(`${API_URL}/test/tests/${test_id}`);
      const test = testResponse.data;

      setTest(test);
      console.log("test", test);

      // Create formData object from API response
      const newFormData = {
        test_name: test.test_name,
        test_description: test.test_description,
        test_type: test.test_type,
        testVisibility: test.test_visibility,
        creatorID: test.creator_id,
        start_date: test.start_date,
        end_date: test.end_date,
        created_at: test.created_at,
        result_date: test.result_release_date,
        test_fees: test.test_fees,
        interest_id: test.interest_id,
        test_duration: test.test_duration,
        passing_marks: test.passing_marks,
        maxMarks: test.max_marks,
        institution: test.institute_id,
        standard: test.standard_type,
        totalCandidates: test.total_candidates,
        resultDeclared: test.is_result_declared,
        testLanguage: test.test_lang,
        testLogo: test.logo || null,
      };

      // Now update both states correctly

      console.log("Result Declaration:", test.is_result_declared);
      setFormData(newFormData);
      setInitialFormData(newFormData); // ✅ use newFormData, not old formData
      setOriginalFormData(newFormData);

      // 2. Fetch creator details using creator_id from test
      if (test.creator_id) {
        const creatorResponse = await axios.get(
          `${API_URL}/user/users/${test.creator_id}`,
        );
        const creator = creatorResponse.data;

        //console.log("creator", creator);

        //setCreatorData(creator.role_id);

        setCreatorData({
          creatorRole: roleMap[creator.role_id] || "Unknown",
          creatorName: creator.name,
        });
      }

      // 3. Fetch institute details using institute_id from test
      if (test.institute_id) {
        const instituteResponse = await axios.get(
          `${API_URL}/institute/institutions/${test.institute_id}`,
        );
        const institute = instituteResponse.data;

        console.log(institute);

        setInstituteData({
          instituteType: institute.institute_type,
          instituteName: institute.institute_name,
        });
      }

      if (test.test_fees) {
        setPricing(`${test.test_fees}`);
      } else {
        setPricing("0");
      }

      if (!test.result_release_date) {
        setScheduleResultRelease("Auto");
      } else {
        setScheduleResultRelease("Schedule");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchTestAndCreator();
  }, [test_id]);

  useEffect(() => {
    axios
      .get(`${API_URL}/test/interests`)
      .then((response) => {
        setInterests(response.data);
      })
      .catch((error) => {
        console.error("Error fetching interests:", error);
      });
  }, []);

  const [editModes, setEditModes] = useState({
    testName: false,
    testDescription: false,
    testCategory: false,
    testVisibility: false,
    creator: false,
    startDate: false,
    endDate: false,
    createdDate: false,
    resultDate: false,
    testPricing: false,
    interest: false,
    testDuration: false,
    passingMarks: false,
    maxMarks: false,
    institution: false,
    standard: false,
    totalCandidates: false,
    resultDeclared: false,
    testLanguage: false,
    testLogo: false,
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveAlert, setShowSaveAlert] = useState(false);
  const [showCancelAlert, setShowCancelAlert] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const actionsButtonRef = useRef(null);

  const toggleEditMode = (field) => {
    setEditModes((prev) => ({ ...prev, [field]: true }));
    toast.info("Editing enabled. Don't forget to save your changes.");
  };

  const handleInputChange = (e, field) => {
    const value = e.target.type === "file" ? e.target.files[0] : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleInputBlur = (field) => {
    setEditModes((prev) => ({ ...prev, [field]: false }));
  };

  const handleSave = () => {
    if (!showCancelAlert) {
      setShowSaveAlert(true);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 500 * 1024; // 500KB

      // 1. Validate file size
      if (file.size > maxSize) {
        toast.error("Logo must be smaller than 500KB");
        e.target.value = "";
        return;
      }

      // 2. Validate dimensions
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        if (img.width > 300 || img.height > 350) {
          toast.error("Logo must be at most 300x350 pixels");
          e.target.value = "";
        } else {
          setLogoFile(file);
          setLogoUploaded(true);
          setHasChanges(true);
        }
      };
    }
  };

  const confirmSave = async () => {
    setInitialFormData({ ...formData });
    setEditModes({
      testName: false,
      testDescription: false,
      testCategory: false,
      startDate: false,
      endDate: false,
      createdDate: false,
      testPricing: false,
      interest: false,
      testDuration: false,
      passingMarks: false,
      maxMarks: false,
      institution: false,
      standard: false,
      totalCandidates: false,
      resultDeclared: false,
      testLanguage: false,
      testLogo: false,
    });

    const updatedData = getUpdatedFields(formData);

    const formDataToSend = new FormData();

    // Add updated text fields
    Object.keys(updatedData).forEach((key) => {
      formDataToSend.append(key, updatedData[key]);
    });

    // Add logo file if uploaded
    if (logoFile) {
      formDataToSend.append("testLogo", logoFile);

      setLogoFile(null);
      setLogoUploaded(false);
      fileInputRef.current.value = null; // Reset input field
    }

    try {
      await axios.put(
        `${API_URL}/test/update-test/${test_id}`,
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      console.log("Updated Data sent successfully");
      toast.success("Test details updated successfully!");
    } catch (err) {
      console.error("Error updating test:", err);
      toast.error("Failed to update test details");
    }

    console.log("Updated Data:", updatedData);
    await fetchTestAndCreator();
    setShowSaveAlert(false);
    setHasChanges(false);
  };

  const cancelSave = () => {
    console.log("Initial", initialFormData);
    setFormData({ ...initialFormData });
    setEditModes({
      testName: false,
      testDescription: false,
      testCategory: false,
      testVisibility: false,
      creator: false,
      startDate: false,
      endDate: false,
      createdDate: false,
      testPricing: false,
      interest: false,
      testDuration: false,
      passingMarks: false,
      maxMarks: false,
      institution: false,
      standard: false,
      totalCandidates: false,
      resultDeclared: false,
      testLanguage: false,
      testLogo: false,
    });
    setShowSaveAlert(false);
    setHasChanges(false);
  };

  const handleCancel = () => {
    if (!showSaveAlert) {
      setShowCancelAlert(true);
    }
  };

  const confirmCancel = () => {
    console.log("Initial", initialFormData);
    setFormData({ ...initialFormData });
    setEditModes({
      testName: false,
      testDescription: false,
      testCategory: false,
      testVisibility: false,
      creator: false,
      startDate: false,
      endDate: false,
      createdDate: false,
      testPricing: false,
      interest: false,
      testDuration: false,
      passingMarks: false,
      maxMarks: false,
      institution: false,
      standard: false,
      totalCandidates: false,
      resultDeclared: false,
      testLanguage: false,
      testLogo: false,
    });
    setShowCancelAlert(false);
    setHasChanges(false);

    if (logoFile) {
      setLogoFile(null);
      setLogoUploaded(false);
      fileInputRef.current.value = null; // Reset input field
    }
  };

  const closeCancelAlert = () => {
    setShowCancelAlert(false);
  };

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        actionsButtonRef.current &&
        !actionsButtonRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchTest = async () => {
    try {
      const res = await axios.get(`${API_URL}/test/tests/${test_id}`);
      setTest(res.data);
      console.log(res.data);
    } catch (err) {
      console.error("Error fetching test:", err);
    }
  };

  const handleTestStatus = async (test_id, status) => {
    try {
      await axios.put(`${API_URL}/test/tests/${test_id}`, {
        status,
      });
      toast.success(`Test ${status.toLowerCase()} successfully`);
      fetchTest();
    } catch (err) {
      console.error(`Error updating test status to ${status}:`, err);
    }
  };

  const downloadAllCertificates = async (testId) => {
    try {
      const response = await axios.get(
        `${API_URL}/cert-repo/generate-all-certificates?test_id=${testId}`,
        {
          responseType: "blob", // important for binary data
        },
      );

      // Create a downloadable link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `certificates_${testId}.zip`); // ZIP filename
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading certificates:", error);
    }
  };

  const handleStatusRelease = (releaseStatus) => {
    let date = null;

    if (releaseStatus === "Schedule" && scheduleResultDate) {
      // Convert "2025-09-17T22:45" → "2025-09-17 22:45:00"
      date = scheduleResultDate.replace("T", " ") + ":00";
    }

    axios
      .post(`${API_URL}/test/result-release-date`, {
        resultReleaseDate: date,
        testID: test_id,
      })
      .then((res) => {
        console.log("Result release date set successfully:", res.data);
        toast.success(res.data.message); // 👈 show backend message in alert
      })
      .catch((err) => {
        if (err.response) {
          console.error("Backend error:", err.response.data);
          toast.error("Error: " + err.response.data.error);
        } else {
          console.error("Axios error:", err.message);
          toast.error("Request failed: " + err.message);
        }
      });
  };

  const listOfParticipants = async (testId) => {
    navigate(`/dashboard/managequiz/quiz-detail/${test_id}/participants`);
  };

  const downloadAllReports = async (reports) => {
    try {
      const response = await axios.post(
        `${API_URL}/cert-repo/generate-all-reports`,
        { reports },
        {
          responseType: "blob", // important to receive binary data
        },
      );

      // Create download link
      const blob = new Blob([response.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "reports.zip");
      document.body.appendChild(link);
      link.click();

      // Clean up
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading reports:", err);
      toast.error("Failed to download reports");
    }
  };

  const handlePreview = (test_id, testLang) => {
    navigate(
      `/dashboard/managequiz/quiz-detail/quiz-preview/${test_id}/${testLang}`,
      {
        state: {
          previewSource: "backend",
        },
      },
    );
  };

  const canEdit = formData.test_status !== "Expired";

  return (
    <div className="full-test-details-container">
      <div className="sticky-container">
        <div className="sticky-buttons">
          <h2>Actions</h2>
          <hr />
          {/* <button className="action-button preview-button">Preview</button> */}
          {test && (
            <>
              {(test.test_status == 'Live' || test.test_status == 'Expired') &&
                (test.total_participated > 0) && (
                  <button className="action-button download-button"
                    onClick={() => listOfParticipants(test.test_id)}
                  >

                    List of Participants

                  </button>
                )}

              {test.test_lang != "both" && (
                <button
                  className="action-button download-button"
                  onClick={() => handlePreview(test.test_id, test.test_lang)}
                >
                  Quiz Preview
                </button>
              )}

              {test.test_lang === "both" && (
                <button
                  className="action-button download-button"
                  onClick={() => handlePreview(test.test_id, "hindi")}
                >
                  Quiz Preview Hindi
                </button>
              )}

              {test.test_lang === "both" && (
                <button
                  className="action-button download-button"
                  onClick={() => handlePreview(test.test_id, "english")}
                >
                  Quiz Preview English
                </button>
              )}

              {(test.test_status == "Live" || test.test_status == "Expired") &&
                test.total_participated > 0 && (
                  <button
                    className="action-button download-button"
                    onClick={() => downloadAllCertificates(test.test_id)}
                  >
                    Download Bulk Certificates of all Participants
                  </button>
                )}

              {/* {(test.test_status == 'Live') && (
            <button className="action-button download-button"
              onClick={() => downloadAllReports()}
            >

            Download Bulk Reports of all Participants
            
            </button>
          )} */}
              {/* {test.test_status == 'Live' && (
                <>
                  <h4>Schedule Result Release</h4>
                  <label>
                    <input
                      type="radio"
                      name="scheduleResultRelease"
                      value="Auto"
                      checked={scheduleResultRelease === "Auto"}
                      onChange={(e) => setScheduleResultRelease(e.target.value)}
                    />
                    Auto Release

                  </label>
                  <label>
                    <input
                      type="radio"
                      name="scheduleResultRelease"
                      value="Schedule"
                      checked={scheduleResultRelease === "Schedule"}
                      onChange={(e) => setScheduleResultRelease(e.target.value)}
                    />
                    Schedule Release
                  </label>
                  {scheduleResultRelease === "Schedule" && (
                    <>
                      <label>Select Date & Time:</label>
                      <input
                        type="datetime-local"
                        name="scheduleDateTime"
                        onChange={(e) => setScheduleResultDate(e.target.value)}
                      />

                    </>
                  )}
                  <button
                    onClick={() => handleStatusRelease(scheduleResultRelease)}
                  >
                    Ok
                  </button>
                </>
              )} */}

              {/* {(test.test_status == "Pending" ||
                test.test_status == "Rejected") && (
                  <button
                    className="action-button approve-button"
                    onClick={() => handleTestStatus(test.test_id, "Approved")}
                  >
                    Approve Test
                  </button>
                )}

              {test.test_status == "Pending" && (
                <button
                  className="action-button reject-button"
                  onClick={() => handleTestStatus(test.test_id, "Rejected")}
                >
                  Reject Test
                </button>
              )} */}
            </>
          )}

          {/* <button className="action-button delete-button" 
            onClick={() => handleDeleteTest(test.test_id)}          
          >
            Delete Test
            
            </button>             */}
        </div>
      </div>
      <div className="main-content-container">
        <div className="sticky-header">
          <div className="header-content">
            {test ? (
              <>
                <h1 className="test-name">{test.test_name}</h1>
                <span className="test-status">Status: {test.test_status}</span>
              </>
            ) : (
              <p>Loading test details...</p>
            )}
          </div>
        </div>
        {/**for mobile version action buttons */}
        <div className="actions-dropdown-container">
          <button
            className="actions-button"
            onClick={toggleDropdown}
            ref={actionsButtonRef}
          >
            Actions
          </button>
          {showDropdown && (
            <div className="actions-dropdown" ref={dropdownRef}>
              <div className="actions-dropdown-content">
                <button className="action-button preview-button">
                  Preview
                </button>
                {test && (
                  <>
                    {(test.test_status == 'Live' || test.test_status == 'Expired') &&
                      (test.total_participated > 0) && (
                        <button className="action-button download-button"
                          onClick={() => listOfParticipants(test.test_id)}
                        >

                          List of Participants

                        </button>
                      )}

                    {test.test_lang != "both" && (
                      <button
                        className="action-button download-button"
                        onClick={() => handlePreview(test.test_id, test.test_lang)}
                      >
                        Quiz Preview
                      </button>
                    )}

                    {test.test_lang === "both" && (
                      <button
                        className="action-button download-button"
                        onClick={() => handlePreview(test.test_id, "hindi")}
                      >
                        Quiz Preview Hindi
                      </button>
                    )}

                    {test.test_lang === "both" && (
                      <button
                        className="action-button download-button"
                        onClick={() => handlePreview(test.test_id, "english")}
                      >
                        Quiz Preview English
                      </button>
                    )}

                    {(test.test_status == "Live" ||
                      test.test_status == "Expired") &&
                      test.total_participated > 0 && (
                        <button
                          className="action-button download-button"
                          onClick={() => downloadAllCertificates(test.test_id)}
                        >
                          Download Bulk Certificates of all Participants
                        </button>
                      )}
                    {/* {(test.test_status == "Pending" ||
                      test.test_status == "Rejected") && (
                        <button
                          className="action-button approve-button"
                          onClick={() =>
                            handleTestStatus(test.test_id, "Approved")
                          }
                        >
                          Approve Test
                        </button>
                      )} */}

                    {/* {test.test_status == "Pending" && (
                      <button
                        className="action-button reject-button"
                        onClick={() =>
                          handleTestStatus(test.test_id, "Rejected")
                        }
                      >
                        Reject Test
                      </button>
                    )} */}
                  </>
                )}
                {/**<button className="action-button download-button">Download Certificate</button>
                <button className="action-button approve-button">Approve Test</button>
                <button className="action-button reject-button">Reject Test</button>
                <button className="action-button delete-button">Delete Test</button>**/}
              </div>
            </div>
          )}
        </div>
        {/**form starts */}
        <div className="form-content">
          <div className="form-section">
            <legend>Test Details</legend>
            <div className="form-row">
              {test && (
                <div className="form-group">
                  <label htmlFor="testID">Test ID</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="testID"
                      value={test.test_id}
                      readOnly={true}
                    />
                  </div>
                </div>
              )}
              <div className="form-group">
                <label htmlFor="testName">Test Name</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="testName"
                    value={formData.test_name}
                    readOnly={!editModes.testName}
                    onChange={(e) => handleInputChange(e, "test_name")}
                    onBlur={() => handleInputBlur("test_name")}
                  />

                  {canEdit && (
                    <button
                      type="button"
                      className="edit-toggle"
                      onClick={() => toggleEditMode("testName")}
                      title={editModes.testName ? "Lock" : "Edit"}
                    >
                      <img src={"/images/edit.png"} alt="Toggle Edit" />
                    </button>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="testDescription">Test Description</label>
                <div className="input-wrapper">
                  <textarea
                    id="testDescription"
                    value={formData.test_description}
                    readOnly={!editModes.testDescription}
                    onChange={(e) => handleInputChange(e, "test_description")}
                    onBlur={() => handleInputBlur("test_description")}
                  />
                  {canEdit && (
                    <button
                      type="button"
                      className="edit-toggle"
                      onClick={() => toggleEditMode("testDescription")}
                      title={editModes.testDescription ? "Lock" : "Edit"}
                    >
                      <img src={"/images/edit.png"} alt="Toggle Edit" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="form-row">
              {user?.role_id != 3 && (
                <div className="form-group">
                  <label htmlFor="testVisibility">Test Visibility</label>
                  <div className="input-wrapper">
                    <input
                      id="testVisibility"
                      value={formData.testVisibility}
                      disabled={!editModes.testVisibility}
                      onChange={(e) => handleInputChange(e, "testVisibility")}
                      onBlur={() => handleInputBlur("testVisibility")}
                    />
                    {/* <option value="institutional">Institutional</option>
                    <option value="global">Global</option>
                    <option value="interest">Interest Based</option>
                  </select> */}
                    {/* <button
                    type="button"
                    className="edit-toggle"
                    onClick={() => toggleEditMode('testVisibility')}
                    title={editModes.testVisibility ? 'Lock' : 'Edit'}
                  >
                    <img src={'/edit.png'} alt="Toggle Edit" />
                  </button> */}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="testCategory">Test Category</label>
                <div className="input-wrapper">
                  <select
                    id="testCategory"
                    value={formData.test_type}
                    disabled={!editModes.testCategory}
                    onChange={(e) => handleInputChange(e, "test_type")}
                    onBlur={() => handleInputBlur("test_type")}
                  >
                    <option value="General">General</option>
                    <option value="Competitive">Competitive</option>
                    <option value="Mock">Mock</option>
                    <option value="Academic">Academic</option>
                  </select>
                  {canEdit && (
                    <button
                      type="button"
                      className="edit-toggle"
                      onClick={() => toggleEditMode("testCategory")}
                      title={editModes.testCategory ? "Lock" : "Edit"}
                    >
                      <img src={"/images/edit.png"} alt="Toggle Edit" />
                    </button>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="testDuration">Test Duration (minutes)</label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    id="testDuration"
                    value={formData.test_duration}
                    readOnly={!editModes.testDuration}
                    onChange={(e) => handleInputChange(e, "test_duration")}
                    onBlur={() => handleInputBlur("test_duration")}
                  />
                  {canEdit && (
                    <button
                      type="button"
                      className="edit-toggle"
                      onClick={() => toggleEditMode("testDuration")}
                      title={editModes.testDuration ? "Lock" : "Edit"}
                    >
                      <img src={"/images/edit.png"} alt="Toggle Edit" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="form-row">
              {user?.role_id === 3 && user?.user_id === test?.creator_id && (
                <div className="form-group">
                  <label htmlFor="creator">Creator ID</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="creator"
                      value={formData.creatorID}
                      readOnly={!editModes.creator}
                      onChange={(e) => handleInputChange(e, "creator")}
                      onBlur={() => handleInputBlur("creator")}
                    />
                    {/* <button
                    type="button"
                    className="edit-toggle"
                    onClick={() => toggleEditMode('creator')}
                    title={editModes.creator ? 'Lock' : 'Edit'}
                  >
                    <img src={'/edit.png'} alt="Toggle Edit" />
                  </button> */}
                  </div>
                </div>
              )}
              <div className="form-group">
                <label htmlFor="creator">
                  {user?.role_id === 3 && user?.user_id !== test?.creator_id
                    ? "Creator By"
                    : "Creator Role"}
                </label>

                <div className="input-wrapper">
                  <input
                    type="text"
                    id="creatorRole"
                    value={
                      user?.role_id === 3 && user?.user_id !== test?.creator_id
                        ? "NGO"
                        : creatorData.creatorRole
                    }
                    readOnly={!editModes.creator}
                    onChange={(e) => handleInputChange(e, "creator")}
                    onBlur={() => handleInputBlur("creator")}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="creator">Creator Name</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="creatorName"
                    value={creatorData.creatorName}
                    readOnly={!editModes.creator}
                    onChange={(e) => handleInputChange(e, "creator")}
                    onBlur={() => handleInputBlur("creator")}
                  />
                  {/* <button
                    type="button"
                    className="edit-toggle"
                    onClick={() => toggleEditMode('creator')}
                    title={editModes.creator ? 'Lock' : 'Edit'}
                  >
                    <img src={'/edit.png'} alt="Toggle Edit" />
                  </button> */}
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="maxMarks">Max Marks</label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    id="maxMarks"
                    value={formData.maxMarks}
                    readOnly={!editModes.maxMarks}
                    onChange={(e) => handleInputChange(e, "maxMarks")}
                    onBlur={() => handleInputBlur("maxMarks")}
                  />
                  {/* <button
                    type="button"
                    className="edit-toggle"
                    onClick={() => toggleEditMode('maxMarks')}
                    title={editModes.maxMarks ? 'Lock' : 'Edit'}
                  >
                    <img src={'/edit.png'} alt="Toggle Edit" />
                  </button> */}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="passingMarks">Passing Marks</label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    id="passingMarks"
                    value={formData.passing_marks}
                    readOnly={!editModes.passingMarks}
                    onChange={(e) => handleInputChange(e, "passing_marks")}
                    onBlur={() => handleInputBlur("passing_marks")}
                  />
                  {canEdit && (
                    <button
                      type="button"
                      className="edit-toggle"
                      onClick={() => toggleEditMode("passingMarks")}
                      title={editModes.passingMarks ? "Lock" : "Edit"}
                    >
                      <img src={"/images/edit.png"} alt="Toggle Edit" />
                    </button>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="testLanguage">Test Language</label>
                <div className="input-wrapper">
                  <select
                    id="testLanguage"
                    value={formData.testLanguage}
                    disabled={!editModes.testLanguage}
                    onChange={(e) => handleInputChange(e, "testLanguage")}
                    onBlur={() => handleInputBlur("testLanguage")}
                  >
                    <option value="both">English and Hindi</option>
                    <option value="hindi">Hindi</option>
                    <option value="english">English</option>
                  </select>
                  {/* <button
                    type="button"
                    className="edit-toggle"
                    onClick={() => toggleEditMode('testLanguage')}
                    title={editModes.testLanguage ? 'Lock' : 'Edit'}
                  >
                    <img src={'/edit.png'} alt="Toggle Edit" />
                  </button> */}
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Start Date</label>
                <div className="input-wrapper">
                  <input
                    type="datetime-local"
                    id="startDate"
                    value={formData.start_date}
                    readOnly={!editModes.startDate}
                    onChange={(e) => handleInputChange(e, "start_date")}
                    onBlur={() => handleInputBlur("start_date")}
                  />
                  {test &&
                    test.test_status !== "Live" &&
                    test.test_status !== "Expired" && (
                      <button
                        type="button"
                        className="edit-toggle"
                        onClick={() => toggleEditMode("startDate")}
                        title={editModes.startDate ? "Lock" : "Edit"}
                      >
                        <img src={"/images/edit.png"} alt="Toggle Edit" />
                      </button>
                    )}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="endDate">End Date</label>
                <div className="input-wrapper">
                  <input
                    type="datetime-local"
                    id="endDate"
                    value={formData.end_date}
                    readOnly={!editModes.endDate}
                    onChange={(e) => handleInputChange(e, "end_date")}
                    onBlur={() => handleInputBlur("end_date")}
                  />
                  {canEdit && (
                    <button
                      type="button"
                      className="edit-toggle"
                      onClick={() => toggleEditMode("endDate")}
                      title={editModes.endDate ? "Lock" : "Edit"}
                    >
                      <img src={"/images/edit.png"} alt="Toggle Edit" />
                    </button>
                  )}
                </div>
              </div>

              {test && test.result_release_date && (
                <div className="form-group">
                  <label htmlFor="resultDate">Result Date</label>
                  <div className="input-wrapper">
                    <input
                      type="datetime-local"
                      id="endDate"
                      value={formData.result_date}
                      readOnly={!editModes.resultDate}
                      onChange={(e) => handleInputChange(e, "result_date")}
                      onBlur={() => handleInputBlur("result_date")}
                    />
                    {test && test.is_result_declared === "No" && (
                      <button
                        type="button"
                        className="edit-toggle"
                        onClick={() => toggleEditMode("resultDate")}
                        title={editModes.resultDate ? "Lock" : "Edit"}
                      >
                        <img src={"/images/edit.png"} alt="Toggle Edit" />
                      </button>
                    )}
                  </div>
                </div>
              )}
              {test && test.test_fees && (
                <div className="form-group">
                  <label htmlFor="testFees">Test Fees</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="testPricing"
                      value={formData.test_fees}
                      readOnly={!editModes.testPricing}
                      onChange={(e) => handleInputChange(e, "test_fees")}
                      onBlur={() => handleInputBlur("test_fees")}
                    />
                    <button
                      type="button"
                      className="edit-toggle"
                      onClick={() => toggleEditMode("testPricing")}
                      title={editModes.testPricing ? "Lock" : "Edit"}
                    >
                      <img src={"/images/edit.png"} alt="Toggle Edit" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {test && test.institute_id && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="institution">Institution ID</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="institution"
                      value={formData.institution}
                      readOnly={!editModes.institution}
                      onChange={(e) => handleInputChange(e, "institution")}
                      onBlur={() => handleInputBlur("institution")}
                    />
                    {/* <button
                    type="button"
                    className="edit-toggle"
                    onClick={() => toggleEditMode('institution')}
                    title={editModes.institution ? 'Lock' : 'Edit'}
                  >
                    <img src={'/edit.png'} alt="Toggle Edit" />
                  </button> */}
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="institution">Institution Type</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="institution"
                      value={instituteData.instituteType}
                      readOnly={!editModes.institution}
                      onChange={(e) => handleInputChange(e, "institution")}
                      onBlur={() => handleInputBlur("institution")}
                    />
                    {/* <button
                    type="button"
                    className="edit-toggle"
                    onClick={() => toggleEditMode('institution')}
                    title={editModes.institution ? 'Lock' : 'Edit'}
                  >
                    <img src={'/edit.png'} alt="Toggle Edit" />
                  </button> */}
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="institution">Institution Name</label>
                  <div className="input-wrapper">
                    <textarea
                      type="text"
                      id="institution"
                      value={instituteData.instituteName}
                      readOnly={!editModes.institution}
                      onChange={(e) => handleInputChange(e, "institution")}
                      onBlur={() => handleInputBlur("institution")}
                    />
                    {/* <button
                    type="button"
                    className="edit-toggle"
                    onClick={() => toggleEditMode('institution')}
                    title={editModes.institution ? 'Lock' : 'Edit'}
                  >
                    <img src={'/edit.png'} alt="Toggle Edit" />
                  </button> */}
                  </div>
                </div>
              </div>
            )}
            <div className="form-row">
              {test && test.interest_id && (
                <div className="form-group">
                  <label htmlFor="interest">Interest</label>
                  <div className="input-wrapper">
                    <select
                      id="interest"
                      value={formData.interest_id || ""}
                      disabled={!editModes.interest}
                      onChange={(e) => handleInputChange(e, "interest_id")}
                      onBlur={() => handleInputBlur("interest_id")}
                    >
                      <option value="">Select Interest</option>

                      {interests.map((interest) => (
                        <option
                          key={interest.interest_id}
                          value={interest.interest_id}
                        >
                          {interest.interest_name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="edit-toggle"
                      onClick={() => toggleEditMode("interest")}
                      title={editModes.interest ? "Lock" : "Edit"}
                    >
                      <img src={"/images/edit.png"} alt="Toggle Edit" />
                    </button>
                  </div>
                </div>
              )}

              {test && test.institute_id && (
                <div className="form-group">
                  <label htmlFor="standard">{standardLabel}</label>
                  <div className="input-wrapper">
                    <input
                      id="standard"
                      value={formData.standard || "NA"}
                      disabled={!editModes.standard}
                      onChange={(e) => handleInputChange(e, "standard")}
                      onBlur={() => handleInputBlur("standard")}
                    />
                  </div>
                </div>
              )}
              {test &&
                (test.test_status == "Live" ||
                  test.test_status == "Expired") && (
                  <div className="form-group">
                    <label htmlFor="totalCandidates">
                      Total Candidates Appeared
                    </label>
                    <div className="input-wrapper">
                      <input
                        type="number"
                        id="totalCandidates"
                        value={test.total_participated}
                        readOnly={!editModes.totalCandidates}
                        onChange={(e) =>
                          handleInputChange(e, "totalCandidates")
                        }
                        onBlur={() => handleInputBlur("totalCandidates")}
                      />
                      {/* <button
                    type="button"
                    className="edit-toggle"
                    onClick={() => toggleEditMode('totalCandidates')}
                    title={editModes.totalCandidates ? 'Lock' : 'Edit'}
                  >
                    <img src={'/edit.png'} alt="Toggle Edit" />
                  </button> */}
                    </div>
                  </div>
                )}

              {test && test.test_status == "Expired" && (
                <div className="form-group">
                  <label htmlFor="resultDeclared">Result Declared</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="resultDeclared"
                      value={test.is_result_declared}
                      readOnly={!editModes.resultDeclared}
                      onChange={(e) => handleInputChange(e, "resultDeclared")}
                      onBlur={() => handleInputBlur("resultDeclared")}
                    />
                    {/* <button
                    type="button"
                    className="edit-toggle"
                    onClick={() => toggleEditMode('totalCandidates')}
                    title={editModes.totalCandidates ? 'Lock' : 'Edit'}
                  >
                    <img src={'/edit.png'} alt="Toggle Edit" />
                  </button> */}
                  </div>
                </div>
              )}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="createdDate">Created Date</label>
                <div className="input-wrapper">
                  <input
                    type="datetime-local"
                    id="createdDate"
                    value={formData.created_at}
                    readOnly={!editModes.createdDate}
                    onChange={(e) => handleInputChange(e, "created_at")}
                    onBlur={() => handleInputBlur("created_at")}
                  />
                  <button
                    type="button"
                    className="edit-toggle"
                    onClick={() => toggleEditMode("createdDate")}
                    title={editModes.createdDate ? "Lock" : "Edit"}
                  >
                    {/* <img src={'/images/edit.png'} alt="Toggle Edit" /> */}
                  </button>
                </div>
              </div>
            </div>

            {test && test.logo_path && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="testLogo">Test Logo</label>
                  <div className="input-wrapper">
                    <img
                      src={test.logo_url}
                      alt="Test Logo"
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "contain",
                        margin: "1.2rem",
                      }}
                    />

                    {/* <button
                    type="button"
                    className="edit-toggle"
                    onClick={() => toggleEditMode('testLogo')}
                    title={editModes.testLogo ? 'Lock' : 'Edit'}
                  >
                    <img src={'/edit.png'} alt="Toggle Edit" />
                  </button> */}
                  </div>
                </div>

                <div className="form-group">
                  <div>
                    <input
                      type="file"
                      id="testLogo"
                      accept="image/*"
                      disabled={!editModes.testLogo}
                      onChange={handleLogoUpload}
                      ref={fileInputRef}
                      onBlur={() => handleInputBlur("testLogo")}
                    />
                    <button
                      type="button"
                      className="edit-toggle"
                      onClick={() => toggleEditMode("testLogo")}
                      title={editModes.testLogo ? "Lock" : "Edit"}
                      style={{ marginTop: "-40px" }}
                    >
                      <img src={"/images/edit.png"} alt="Toggle Edit" />
                    </button>

                    <div
                      style={{
                        marginLeft: "80px",
                        fontSize: "12px",
                        color: "#666",
                      }}
                    >
                      (Max 500KB, 300×350px, JPG/PNG)
                    </div>

                    {logoUploaded && (
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          marginTop: "10px",
                        }}
                      >
                        <button
                          type="button"
                          className="preview-button"
                          onClick={() => handleShowPreview("report")}
                        >
                          Preview Test Report
                        </button>
                        <button
                          type="button"
                          className="preview-button"
                          onClick={() => handleShowPreview("certificate")}
                        >
                          Preview Certificate
                        </button>
                        <button
                          type="button"
                          className="cancel-button"
                          onClick={handleCancelUpload}
                        >
                          Cancel Upload
                        </button>
                      </div>
                    )}

                    {/* PDF Preview Dialog */}
                    <Dialog
                      open={showDialog}
                      onClose={handleCloseDialog}
                      fullWidth
                      maxWidth="md"
                    >
                      {previewType === "report" && (
                        <DialogTitle>Test Report Preview</DialogTitle>
                      )}
                      {previewType === "certificate" && (
                        <DialogTitle>Certificate Preview</DialogTitle>
                      )}
                      <DialogContent dividers>
                        {previewUrl && (
                          <iframe
                            title="PDF Preview"
                            src={previewUrl}
                            width="100%"
                            height="600px"
                            style={{ border: "1px solid #ccc" }}
                          />
                        )}
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={handleCloseDialog} color="primary">
                          Close
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </div>
                </div>
              </div>
            )}

            <div className="button-container">
              <button
                type="button"
                className="save-button"
                disabled={!hasChanges || showCancelAlert || showSaveAlert} // Disable when either alert is open
                onClick={handleSave}
              >
                Save
              </button>
              <button
                type="button"
                className="cancel-button"
                disabled={!hasChanges || showSaveAlert || showCancelAlert} // Disable when either alert is open
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
      {/**save alert... */}
      {showSaveAlert &&
        ReactDOM.createPortal(
          <div className="alert-overlay">
            <div className="alert-box">
              <p>Are you sure you want to save these changes?</p>
              <div className="alert-buttons">
                <button onClick={confirmSave}>Yes, Save</button>
                <button onClick={cancelSave}>Cancel</button>
              </div>
            </div>
          </div>,
          document.body,
        )}
      {/**cancel alert... */}
      {showCancelAlert &&
        ReactDOM.createPortal(
          <div className="alert-overlay">
            <div className="alert-box">
              <p>Discard your unsaved changes?</p>
              <div className="alert-buttons">
                <button onClick={confirmCancel}>Yes, Discard</button>
                <button onClick={closeCancelAlert}>No, Keep Editing</button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default FullTestDetails;

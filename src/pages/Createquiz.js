import React, { useState, useEffect, useRef, useContext } from "react";

import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";
//import districtsData from "../res/district.json"; // JSON format: [{ id, state, district }]
import getLoggedInUser from "../utils/auth";
import { UserContext } from "../contexts/UserContext";
import { QuizContext } from "../contexts/QuizContext";
import Navbar from "../components/Navbar";
import "./css/ExcelUploader.css"; // Import the CSS
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";

// const API_URL = process.env.REACT_APP_API_URL;
const API_URL = process.env.REACT_APP_API_URL;

const ExcelUploader = () => {
  const [showPreview, setShowPreview] = useState(false);

  const [logoUploaded, setLogoUploaded] = useState(false);

  const [selectedState, setSelectedState] = useState("");
  const [institutes, setInstitutes] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [logoFile, setLogoFile] = useState(null);

  const [email, setEmail] = useState("");

  const [selectedLogo, setSelectedLogo] = useState(null);
  const [instituteData, setInstituteData] = useState(null);
  const [standardData, setStandardData] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [previewType, setPreviewType] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false); // New state for preview dialog
  const fileInputRef = useRef();
  const goingToPreviewRef = useRef(false);
  const [districtsData, setDistrictsData] = useState([]);
  const { user } = useContext(UserContext);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [englishQuestionName, setEnglishQuestionName] = useState("");
  const [englishAnswerName, setEnglishAnswerName] = useState("");
  const [hindiQuestionName, setHindiQuestionName] = useState("");
  const [hindiAnswerName, setHindiAnswerName] = useState("");
  const [errors, setErrors] = useState({});
  const [interests, setInterests] = useState([]);
  const [cityVal, setCityVal] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [typeVal, setTypeVal] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const {
    formData,
    setFormData,

    englishQuestionOptionsList,
    setEnglishQuestionOptionsList,

    hindiQuestionOptionsList,
    setHindiQuestionOptionsList,

    questionOptionsList,
    setQuestionOptionsList,

    data,
    setData,

    resetQuiz,
  } = useContext(QuizContext);

  const QUIZ_DRAFT_KEY = "createQuizDraft";
  const QUIZ_FILES_DB = "quizFilesDB";
  const QUIZ_FILES_STORE = "files";

  useEffect(() => {
    return () => {
      if (!goingToPreviewRef.current) {
        localStorage.removeItem(QUIZ_DRAFT_KEY);
        clearQuizFilesFromDB().catch((err) =>
          console.error("Failed to clear quiz files on back navigation:", err),
        );
        if (typeof resetQuiz === "function") {
          resetQuiz();
        } else {
          setFormData({
            testname: "",
            testdesc: "",
            testtype: "",
            testlang: "",
            testduration: "",
            maxmarks: "",
            cutoffmarks: "",
            startDateTime: "",
            endDateTime: "",
            paidTest: "No",
            testFeesValue: null,
            scheduleTest: "No",
            testVisibility: "Global",
            institutionType: "",
            standard_type: null,
            institutionState: "",
            institutionCity: "",
            institutionName: "",
            interestArea: "",
            englishQuestionFile: null,
            englishAnswerFile: null,
            hindiQuestionFile: null,
            hindiAnswerFile: null,
            resultReleaseDate: "",
            resultRelease: "Yes",
          });
          setEnglishQuestionOptionsList([]);
          setHindiQuestionOptionsList([]);
          setQuestionOptionsList([]);
          setData([]);
        }
      }
    };
  }, []);

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

  // ===============================
  // Institute-linked user (role_id === 3) auto fetch
  // ===============================
  useEffect(() => {
    const getInstitute = async () => {
      if (!user?.institute_id) return;

      try {
        const res = await axios.get(
          `${API_URL}/institute/institutions/${user.institute_id}`,
          {
            params: {
              state: stateVal || null,
              city: cityVal || null,
              institute_type: typeVal || null,
            },
          },
        );

        setInstituteData(res.data);
        setTypeVal(res.data.institute_type);
        console.log("results-->", res.data);
      } catch (err) {
        console.error(err);
      }
    };

    // Run only for role 3
    if (user?.role_id === 3) {
      getInstitute();
    }
  }, [user?.role, user?.institute_id, stateVal, cityVal, typeVal]);

  useEffect(() => {
    const cameFromPreview =
      sessionStorage.getItem("returningFromPreview") === "true";

    if (cameFromPreview) {
      // Preview se wapas aaye ho, saved files restore karo
      sessionStorage.removeItem("returningFromPreview");

      const restoreFiles = async () => {
        try {
          const engQ = await getQuizFileFromDB("englishQuestionFile");
          const engA = await getQuizFileFromDB("englishAnswerFile");
          const hinQ = await getQuizFileFromDB("hindiQuestionFile");
          const hinA = await getQuizFileFromDB("hindiAnswerFile");

          if (engQ) {
            setFormData((prev) => ({ ...prev, englishQuestionFile: engQ }));
            setEnglishQuestionName(engQ.name);
          }
          if (engA) {
            setFormData((prev) => ({ ...prev, englishAnswerFile: engA }));
            setEnglishAnswerName(engA.name);
          }
          if (hinQ) {
            setFormData((prev) => ({ ...prev, hindiQuestionFile: hinQ }));
            setHindiQuestionName(hinQ.name);
          }
          if (hinA) {
            setFormData((prev) => ({ ...prev, hindiAnswerFile: hinA }));
            setHindiAnswerName(hinA.name);
          }
        } catch (err) {
          console.log("No saved files found or error restoring:", err);
        }
      };

      restoreFiles();
    } else {
      // Genuine page refresh / fresh visit — purani files clear kardo
      clearQuizFilesFromDB().catch((err) =>
        console.error("Failed to clear quiz files on load:", err),
      );
    }
  }, []);

  useEffect(() => {
    if (!user || user.role_id !== 3) return;

    axios
      .get(`${API_URL}/institute/standards/${user.institute_id}`)
      .then((res) => {
        setStandardData(res.data);
      })
      .catch((err) => {
        console.error("Error fetching standards:", err);
      });
  }, [user]);

  const handlePreview = (test_lang = null) => {
    let sourceList;

    if (test_lang == null) {
      sourceList =
        formData.testlang === "hindi"
          ? hindiQuestionOptionsList
          : englishQuestionOptionsList;
    } else {
      sourceList =
        test_lang === "hindi"
          ? hindiQuestionOptionsList
          : englishQuestionOptionsList;
    }

    const totalQ = sourceList.length || 1;
    const perQuestionMarks = formData.maxmarks
      ? Number(formData.maxmarks) / totalQ
      : 1;

    const mappedQuestions = sourceList.map((q, idx) => ({
      question_id: `preview-${idx}`,
      question_text: q.question,
      option_a: q.options[0] || "",
      option_b: q.options[1] || "",
      option_c: q.options[2] || "",
      option_d: q.options[3] || "",
      correct_answer: (q.answer || "").trim().toLowerCase(),
      answer_description: q.answer_description || "",
      // marks: perQuestionMarks,
      marks: q.marks || "",
    }));

    goingToPreviewRef.current = true;
    sessionStorage.setItem("returningFromPreview", "true");

    navigate("/dashboard/createquiz/quiz-preview", {
      state: {
        previewSource: "context",
        previewQuestions: mappedQuestions,
        previewTest: {
          test_name: formData.testname,
          test_desc: formData.testdesc,
          test_duration: Number(formData.testduration) || 0,
          max_marks: Number(formData.maxmarks) || 0,
          test_lang: test_lang ?? formData.testlang,
        },
      },
    });
  };

  const handleCancelUpload = () => {
    setLogoFile(null);
    setLogoUploaded(false);
    fileInputRef.current.value = null; // Reset input field
  };

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

  const handleCloseDialog = () => setShowDialog(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) {
      setEmail(storedEmail);
    }
    // Extract and set unique states
    const uniqueStates = [...new Set(districtsData.map((item) => item.state))];
    setStates(uniqueStates);
  }, []);

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

  const handleVisibilityChange = (e) => {
    const visibility = e.target.value;

    setFormData((prev) => ({
      ...prev,
      testVisibility: visibility,

      // Reset dependent fields
      interestArea: "",
      instituteId: "",
    }));
  };

  const handleStateChange = (e) => {
    const state = e.target.value;
    setSelectedState(state);

    const filteredDistricts = districtsData
      .filter((item) => item.state === state)
      .map((item) => item.district);

    // Get unique city names
    const uniqueDistricts = [...new Set(filteredDistricts)];
    setDistricts(uniqueDistricts);

    setFormData((prev) => ({ ...prev, institutionState: state }));
  };

  const fetchInstitutions = async (instituteType, state, city) => {
    try {
      const response = await axios.get(`${API_URL}/institute/institutions`, {
        params: {
          type: instituteType,
          state,
          city,
        },
      });

      //console.log("Institute Response-->", response);
      // Get the array
      const instituteData = response.data.data;

      // Sort alphabetically
      const sortedInstituteData = instituteData.sort((a, b) =>
        a.institute_name.localeCompare(b.institute_name, "en", {
          sensitivity: "base",
        }),
      );

      setInstitutes(sortedInstituteData);
    } catch (error) {
      console.error("Error fetching institutions:", error);
    }
  };

  const handleDistrictChange = (e) => {
    const districtValue = e.target.value;
    setFormData((prev) => ({ ...prev, institutionCity: districtValue }));

    if (
      formData.institutionType &&
      formData.institutionState &&
      districtValue
    ) {
      fetchInstitutions(
        formData.institutionType,
        formData.institutionState,
        districtValue,
      );
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxFileSize = 500 * 1024; // 500KB

      if (file.size > maxFileSize) {
        setMessage("Logo must be smaller than 500KB ❌");
        setOpenSuccessDialog(true);
        e.target.value = "";
        return;
      }

      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const { width, height } = img;

        if (width !== 300 || height !== 300) {
          setMessage(
            `Logo must be exactly 300x300 pixels. Your image is ${width}x${height}px. ❌`,
          );
          setOpenSuccessDialog(true);
          e.target.value = "";
          return;
        }

        setLogoFile(file);
        setLogoUploaded(true);
      };
    }
  };
  const [message, setMessage] = useState("");
  // const username = getLoggedInUser();

  // ===============================
  // IndexedDB helpers (for storing uploaded files across the draft)
  // ===============================
  const openQuizFileDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(QUIZ_FILES_DB, 1);

      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains(QUIZ_FILES_STORE)) {
          db.createObjectStore(QUIZ_FILES_STORE);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const saveQuizFileToDB = async (key, file) => {
    if (!file) return;

    const db = await openQuizFileDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(QUIZ_FILES_STORE, "readwrite");

      const store = transaction.objectStore(QUIZ_FILES_STORE);

      store.put(
        {
          file,
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified,
        },
        key,
      );

      transaction.oncomplete = () => {
        db.close();
        resolve();
      };

      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    });
  };

  const getQuizFileFromDB = async (key) => {
    if (!key) return null;

    const db = await openQuizFileDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(QUIZ_FILES_STORE, "readonly");

      const store = transaction.objectStore(QUIZ_FILES_STORE);
      const request = store.get(key);

      request.onsuccess = () => {
        db.close();
        resolve(request.result?.file || null);
      };

      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  };

  const deleteQuizFileFromDB = async (key) => {
    if (!key) return;

    const db = await openQuizFileDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(QUIZ_FILES_STORE, "readwrite");

      const store = transaction.objectStore(QUIZ_FILES_STORE);
      store.delete(key);

      transaction.oncomplete = () => {
        db.close();
        resolve();
      };

      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    });
  };

  const clearQuizFilesFromDB = async () => {
    const db = await openQuizFileDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(QUIZ_FILES_STORE, "readwrite");

      const store = transaction.objectStore(QUIZ_FILES_STORE);
      store.clear();

      transaction.oncomplete = () => {
        db.close();
        resolve();
      };

      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    });
  };

  const handleQuestionFileUpload = (event, langKey) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (e) => {
      const workbook = XLSX.read(e.target.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const allRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const questions = [];

      for (let i = 2; i < allRows.length; i++) {
        const row = allRows[i];
        if (row[0] && row[0].startsWith("Question")) {
          let options = [];
          for (let j = 1; j <= 5 && i + j < allRows.length; j++) {
            if (allRows[i + j][0]?.startsWith("Option")) {
              options.push(allRows[i + j][2] || "");
            }
          }
          questions.push({
            question: row[2],
            options,
            answer: "",
            answer_description: "",
          });
        }
      }

      console.log("Parsed Hindi:", questions);

      if (langKey === "hindi") {
        setHindiQuestionOptionsList(questions);
      } else {
        setEnglishQuestionOptionsList(questions);
      }
      setQuestionOptionsList(questions);
      setData(questions);
    };
  };

  const handleAnswerFileUpload = (event, langKey) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsBinaryString(file);

    reader.onload = (e) => {
      const workbook = XLSX.read(e.target.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const allRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const baseList =
        langKey === "hindi"
          ? hindiQuestionOptionsList
          : englishQuestionOptionsList;

      let updatedQuestions = [...baseList];
      let calculatedTotalMarks = 0;

      for (let i = 4; i < allRows.length; i++) {
        if (updatedQuestions[i - 4]) {
          updatedQuestions[i - 4].answer =
            allRows[i][1]?.toString().trim() || "";

          updatedQuestions[i - 4].answer_description =
            allRows[i][2]?.toString().trim() || "";

          // Read Marks from Column D (index 3)
          const marks = Number(allRows[i][3]) || 0;
          updatedQuestions[i - 4].marks = marks;

          calculatedTotalMarks += marks;
        }
      }

      if (langKey === "hindi") {
        setHindiQuestionOptionsList(updatedQuestions);
      } else {
        setEnglishQuestionOptionsList(updatedQuestions);
      }

      setQuestionOptionsList(updatedQuestions);
      setData(updatedQuestions);

      // Update total marks state
      setFormData((prev) => ({
        ...prev,
        maxmarks: calculatedTotalMarks,
      }));
    };
  };

  // 1. NEW validateField (complete, includes 20-word description limit)
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case "testname":
        if (!value?.trim()) newErrors.testname = "Quiz name is required";
        else delete newErrors.testname;
        break;
      case "testdesc":
        if (!value?.trim()) newErrors.testdesc = "Quiz description is required";
        else if (value.trim().split(/\s+/).length > 20)
          newErrors.testdesc = "Description cannot exceed 20 words";
        else delete newErrors.testdesc;
        break;
      case "testtype":
        if (!value) newErrors.testtype = "Select quiz type";
        else delete newErrors.testtype;
        break;
      case "testlang":
        if (!value) newErrors.testlang = "Select quiz language";
        else delete newErrors.testlang;
        break;
      case "testduration":
        const duration = parseFloat(value);
        if (!value || duration <= 0)
          newErrors.testduration = "Duration must be > 0";
        else delete newErrors.testduration;
        break;
      case "maxmarks":
        const maxmarks = parseFloat(value);
        if (!value || maxmarks <= 0)
          newErrors.maxmarks = "Max marks must be > 0";
        else delete newErrors.maxmarks;
        break;
      case "cutoffmarks":
        const cutoff = parseFloat(value);
        const maxM = parseFloat(formData.maxmarks);
        if (!value || cutoff < 0)
          newErrors.cutoffmarks = "Cutoff cannot be negative";
        else if (maxM && cutoff > maxM)
          newErrors.cutoffmarks = "Cutoff > Max marks";
        else delete newErrors.cutoffmarks;
        break;
      case "testFeesValue":
        if (formData.paidTest === "Yes") {
          const fee = parseFloat(value);
          if (!value || fee <= 0) newErrors.testFeesValue = "Enter valid fee";
          else delete newErrors.testFeesValue;
        } else {
          delete newErrors.testFeesValue;
        }
        break;
      case "startDateTime":
        if (!value) newErrors.startDateTime = "Start date is required";
        else {
          const startDate = new Date(value);
          const now = new Date();
          if (startDate <= now)
            newErrors.startDateTime = "Start date must be future";
          else delete newErrors.startDateTime;
        }
        break;
      case "endDateTime":
        if (!value) newErrors.endDateTime = "End date is required";
        else if (
          formData.startDateTime &&
          new Date(value) <= new Date(formData.startDateTime)
        ) {
          newErrors.endDateTime = "End date must be after start";
        } else {
          delete newErrors.endDateTime;
        }
        break;
      default:
        break;
    }
    setErrors(newErrors);
  };

  const fetchStandards = async (instituteId) => {
    try {
      const response = await axios.get(
        `${API_URL}/institute/standards/${instituteId}`,
      );

      setStandardData(response.data);
    } catch (error) {
      console.error("Error fetching standards:", error);
      setStandardData([]);
    }
  };

  // 2. NEW handleChange (result release date guard + institution standards fetch)
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "resultReleaseDate") {
      const minimumReleaseDate = new Date(
        new Date(formData.endDateTime).getTime() +
          formData.testduration * 60 * 1000,
      );

      const selectedDate = new Date(value);

      if (selectedDate < minimumReleaseDate) {
        alert("Result release date must be after the test evaluation time.");
        return;
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

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

    validateField(name, value);
  };

  // NEW: Quiz Description - limits to 20 words
  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    const words = value.split(/\s+/).filter(Boolean);
    if (words.length > 20) return; // block typing beyond 20 words
    setFormData((prev) => ({ ...prev, testdesc: value }));
    validateField("testdesc", value);
  };

  const handleEnglishQuestionFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      englishQuestionFile: file,
    }));

    setEnglishQuestionName(file.name);

    // Parse Excel
    handleQuestionFileUpload(e, "english");

    setErrors((prev) => ({
      ...prev,
      englishQuestionFile: null,
    }));

    saveQuizFileToDB("englishQuestionFile", file);
  };

  const handleEnglishAnswerFile = (e) => {
    const file = e.target.files?.[0];
    setFormData((prev) => ({ ...prev, englishAnswerFile: file }));
    setEnglishAnswerName(file ? file.name : "");
    if (file) {
      setErrors((prev) => ({ ...prev, englishAnswerFile: null }));
      handleAnswerFileUpload(e, "english");
    }
    saveQuizFileToDB("englishAnswerFile", file);
  };

  const handleHindiQuestionFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      hindiQuestionFile: file,
    }));

    setHindiQuestionName(file.name);

    // Parse the Excel file for Preview
    handleQuestionFileUpload(e, "hindi");

    setErrors((prev) => ({
      ...prev,
      hindiQuestionFile: null,
    }));

    saveQuizFileToDB("hindiQuestionFile", file);
  };

  const handleHindiAnswerFile = (e) => {
    const file = e.target.files?.[0];
    setFormData((prev) => ({ ...prev, hindiAnswerFile: file }));
    setHindiAnswerName(file ? file.name : "");
    if (file) {
      setErrors((prev) => ({ ...prev, hindiAnswerFile: null }));
      handleAnswerFileUpload(e, "hindi");
    }

    saveQuizFileToDB("hindiAnswerFile", file);
  };

  // NEW: Remove handlers for each uploaded file
  const handleRemoveEnglishQuestionFile = async (e) => {
    e.stopPropagation();
    setFormData((prev) => ({ ...prev, englishQuestionFile: null }));
    setEnglishQuestionName("");
    setEnglishQuestionOptionsList([]);
    setQuestionOptionsList([]);
    setData([]);
    try {
      await deleteQuizFileFromDB("englishQuestionFile");
    } catch (err) {
      console.error("Failed to remove English question file:", err);
    }
  };

  const handleRemoveEnglishAnswerFile = async (e) => {
    e.stopPropagation();
    setFormData((prev) => ({ ...prev, englishAnswerFile: null }));
    setEnglishAnswerName("");
    try {
      await deleteQuizFileFromDB("englishAnswerFile");
    } catch (err) {
      console.error("Failed to remove English answer file:", err);
    }
  };

  const handleRemoveHindiQuestionFile = async (e) => {
    e.stopPropagation();
    setFormData((prev) => ({ ...prev, hindiQuestionFile: null }));
    setHindiQuestionName("");
    setHindiQuestionOptionsList([]);
    setQuestionOptionsList([]);
    setData([]);
    try {
      await deleteQuizFileFromDB("hindiQuestionFile");
    } catch (err) {
      console.error("Failed to remove Hindi question file:", err);
    }
  };

  const handleRemoveHindiAnswerFile = async (e) => {
    e.stopPropagation();
    setFormData((prev) => ({ ...prev, hindiAnswerFile: null }));
    setHindiAnswerName("");
    try {
      await deleteQuizFileFromDB("hindiAnswerFile");
    } catch (err) {
      console.error("Failed to remove Hindi answer file:", err);
    }
  };

  const getDefaultResultReleaseDate = () => {
    if (!formData.endDateTime || !formData.testduration) {
      return "";
    }

    const endDate = new Date(formData.endDateTime);

    const resultReleaseDate = new Date(
      endDate.getTime() + Number(formData.testduration) * 60 * 1000,
    );

    const year = resultReleaseDate.getFullYear();
    const month = String(resultReleaseDate.getMonth() + 1).padStart(2, "0");
    const day = String(resultReleaseDate.getDate()).padStart(2, "0");
    const hours = String(resultReleaseDate.getHours()).padStart(2, "0");
    const minutes = String(resultReleaseDate.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleResultReleaseDateChange = (e) => {
    const { value } = e.target;

    if (value === "Yes") {
      const defaultReleaseDate = getDefaultResultReleaseDate();

      setFormData((prev) => ({
        ...prev,
        resultRelease: "Yes",
        resultReleaseDate: defaultReleaseDate,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        resultRelease: "No",
        resultReleaseDate: "",
      }));
    }
  };

  const downloadFile = async (fileName) => {
    try {
      const response = await axios.get(`${API_URL}/test/download/${fileName}`, {
        responseType: "blob",
      });

      const fileURL = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement("a");

      link.href = fileURL;

      link.setAttribute("download", fileName);

      document.body.appendChild(link);

      link.click();

      link.remove();
    } catch (error) {
      console.error("Download failed", error);
    }
  };

  const getMinimumReleaseDate = () => {
    if (!formData.endDateTime || !formData.testduration) {
      return "";
    }

    const minimumDate = new Date(
      new Date(formData.endDateTime).getTime() +
        formData.testduration * 60 * 1000,
    );

    const year = minimumDate.getFullYear();
    const month = String(minimumDate.getMonth() + 1).padStart(2, "0");
    const day = String(minimumDate.getDate()).padStart(2, "0");
    const hours = String(minimumDate.getHours()).padStart(2, "0");
    const minutes = String(minimumDate.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // 4. NEW file validation useEffect (clears stale errors too)
  useEffect(() => {
    const newErrors = { ...errors };

    if (formData.testlang === "english" || formData.testlang === "both") {
      if (!formData.englishQuestionFile)
        newErrors.englishQuestionFile = "English question file required";
      else delete newErrors.englishQuestionFile;

      if (!formData.englishAnswerFile)
        newErrors.englishAnswerFile = "English answer file required";
      else delete newErrors.englishAnswerFile;
    } else {
      delete newErrors.englishQuestionFile;
      delete newErrors.englishAnswerFile;
    }

    if (formData.testlang === "hindi" || formData.testlang === "both") {
      if (!formData.hindiQuestionFile)
        newErrors.hindiQuestionFile = "Hindi question file required";
      else delete newErrors.hindiQuestionFile;

      if (!formData.hindiAnswerFile)
        newErrors.hindiAnswerFile = "Hindi answer file required";
      else delete newErrors.hindiAnswerFile;
    } else {
      delete newErrors.hindiQuestionFile;
      delete newErrors.hindiAnswerFile;
    }

    setErrors(newErrors);
  }, [
    formData.testlang,
    formData.englishQuestionFile,
    formData.englishAnswerFile,
    formData.hindiQuestionFile,
    formData.hindiAnswerFile,
  ]);

  // 5. NEW hasErrors (maxmarks auto-calculated, testtype not required for role_id 3)
  const hasErrors = () => {
    // 1. Check actual validation errors
    if (Object.values(errors).some((err) => err)) return true;

    // 2. Required fields (ONLY important ones)
    const requiredFields = [
      "testname",
      "testdesc",
      // ...(user?.role_id === 3 ? ["testtype"] : []),
      "testlang",
      "testduration",
      "cutoffmarks",
      "startDateTime",
      "endDateTime",
    ];

    for (let field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === "") {
        return true;
      }
    }

    // 3. Conditional validation (IMPORTANT)
    if (
      formData.paidTest === "Yes" &&
      (!formData.testFeesValue || formData.testFeesValue <= 0)
    ) {
      return true;
    }

    if (formData.testlang === "english" || formData.testlang === "both") {
      if (!formData.englishQuestionFile || !formData.englishAnswerFile)
        return true;
    }

    if (formData.testlang === "hindi" || formData.testlang === "both") {
      if (!formData.hindiQuestionFile || !formData.hindiAnswerFile) return true;
    }

    return false;
  };

  // 6. NEW ErrorMessage component (keep this one, it's good)
  const ErrorMessage = ({ field }) => {
    return errors[field] ? (
      <div
        style={{
          color: "#d32f2f",
          fontSize: "0.85rem",
          marginTop: "4px",
          fontWeight: 500,
        }}
      >
        ⚠️ {errors[field]}
      </div>
    ) : null;
  };

  // NEW: Info tooltip icon (the "?" icon shown on hover)
  const InfoTooltip = ({ text }) => (
    <Tooltip
      title={
        <span style={{ fontSize: "13px", lineHeight: "1.5" }}>{text}</span>
      }
      arrow
      placement="top"
      slotProps={{
        tooltip: {
          sx: {
            background: "linear-gradient(135deg, #1e4d7a 0%, #306694 100%)",
            color: "#fff",
            fontSize: "13px",
            fontWeight: 500,
            padding: "10px 14px",
            borderRadius: "12px",
            boxShadow: "0 8px 25px rgba(30, 77, 122, 0.28)",
            maxWidth: "280px",
            textAlign: "left",
            lineHeight: 1.5,
          },
        },
        arrow: {
          sx: {
            color: "#306694",
          },
        },
      }}
    >
      <span className="info-tooltip-icon">?</span>
    </Tooltip>
  );

  // NEW: Upload icon (replaces the old download icon inside the box)
  const UploadIcon = () => (
    <img
      src="/images/upload.png"
      alt="Upload"
      width="28"
      height="28"
      style={{
        display: "block",
        objectFit: "contain",
      }}
    />
  );

  // NEW: Small "Download Sample File" text link (shown below upload box)
  const DownloadSampleLink = ({ onClick }) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        color: "#1565c0",
        fontSize: "0.78rem",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "2px 0",
        flexShrink: 0,
        whiteSpace: "nowrap",
      }}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Download Sample File
    </button>
  );

  // NEW: Uploaded file status text — badge without cross, plus a separate Cancel Upload button below
  const FileUploadStatus = ({ fileName, onRemove }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "0.8rem",
          fontWeight: 500,
          color: "#1e7e34",
          background: "#eaf7ee",
          padding: "3px 10px",
          borderRadius: "12px",
          width: "fit-content",
        }}
      >
        <span style={{ flexShrink: 0 }}>✓</span>
        <span>Uploaded Successfully</span>
      </div>

      <button type="button" onClick={onRemove} className="cancel-upload-btn">
        Cancel Upload
      </button>
    </div>
  );

  // NEW: Blocks re-opening file picker on an already-uploaded input, shows toast instead
  const handleFileInputClick = (e, fileName) => {
    if (fileName) {
      e.preventDefault();
      toast.info("File already uploaded. Remove it first to upload a new one.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (hasErrors()) {
      setMessage("Please fix all red errors before submitting ❌");
      setOpenSuccessDialog(true);
      return;
    }

    const submitData = {
      ...formData,

      resultReleaseDate:
        formData.resultRelease === "Yes"
          ? getDefaultResultReleaseDate()
          : formData.resultReleaseDate,

      ...(user?.role_id === 3 && {
        testtype: "Academic",
        testVisibility: "Institution",
        institutionType: instituteData?.institute_type,
        institutionState: instituteData?.institute_state,
        institutionCity: instituteData?.institute_city,
        institutionName: instituteData?.institute_name,
      }),
    };

    const form = new FormData();

    // Append text fields
    for (const key in submitData) {
      if (
        key !== "englishQuestionFile" &&
        key !== "englishAnswerFile" &&
        key !== "hindiQuestionFile" &&
        key !== "hindiAnswerFile"
      ) {
        form.append(key, submitData[key]);
      }
    }

    // form.append("creator_id", user.id);
    form.append("creator_id", user.id);

    // Append files
    if (formData.testlang === "english" || formData.testlang === "both") {
      if (formData.englishQuestionFile)
        form.append("engQues", formData.englishQuestionFile);
      if (formData.englishAnswerFile)
        form.append("engAns", formData.englishAnswerFile);
    }
    if (formData.testlang === "hindi" || formData.testlang === "both") {
      if (formData.hindiQuestionFile)
        form.append("hinQues", formData.hindiQuestionFile);
      if (formData.hindiAnswerFile)
        form.append("hinAns", formData.hindiAnswerFile);
    }
    if (logoFile) form.append("logo", logoFile);

    try {
      const response = await fetch(`${API_URL}/test/add-test`, {
        method: "POST",
        body: form,
      });
      const result = await response.json();

      if (response.ok) {
        setMessage("Test registered successfully! 🎉");
        setOpenSuccessDialog(true);

        localStorage.removeItem(QUIZ_DRAFT_KEY);
        await clearQuizFilesFromDB();

        // Reset everything
        setFormData({
          testname: "",
          testdesc: "",
          testtype: "",
          testlang: "",
          testduration: "",
          maxmarks: "",
          cutoffmarks: "",
          startDateTime: "",
          endDateTime: "",
          paidTest: "No",
          testFeesValue: null,
          testVisibility: "Global",
          institutionType: "",
          standard_type: null,
          institutionState: "",
          institutionCity: "",
          institutionName: "",
          interestArea: "",
          englishQuestionFile: null,
          englishAnswerFile: null,
          hindiQuestionFile: null,
          hindiAnswerFile: null,
          resultReleaseDate: "",
          resultRelease: "Yes",
        });
        setErrors({});
        setQuestionOptionsList([]);
        setLogoFile(null);
        setLogoUploaded(false);
        if (fileInputRef.current) fileInputRef.current.value = null;

        setEnglishQuestionName("");
        setEnglishAnswerName("");
        setHindiQuestionName("");
        setHindiAnswerName("");

        setEnglishQuestionOptionsList([]);
        setHindiQuestionOptionsList([]);
        setData([]);
      } else {
        setMessage(result.message || "Test Registration failed.");
        setOpenSuccessDialog(true);
      }
    } catch {
      setMessage("Error connecting to server.");
      setOpenSuccessDialog(true);
    }
  };
  return (
    <div>
      {/* Super Simple Success/Error Popup */}
      <Dialog
        open={openSuccessDialog}
        onClose={() => setOpenSuccessDialog(false)}
        className="modern-success-dialog"
        PaperProps={{
          style: {
            borderRadius: "24px",
            overflow: "visible",
            background: "transparent",
            boxShadow: "none",
          },
        }}
      >
        <div
          className={`success-card ${message.includes("successfully") ? "success-mode" : "error-mode"}`}
        >
          {message.includes("successfully") ? (
            <div className="icon-wrapper success-icon-wrapper">
              <svg className="checkmark" viewBox="0 0 52 52">
                <circle
                  className="checkmark-circle"
                  cx="26"
                  cy="26"
                  r="24"
                  fill="none"
                />
                <path
                  className="checkmark-check"
                  fill="none"
                  d="M14 27l7 7 16-16"
                />
              </svg>
              <span className="confetti c1"></span>
              <span className="confetti c2"></span>
              <span className="confetti c3"></span>
              <span className="confetti c4"></span>
              <span className="confetti c5"></span>
              <span className="confetti c6"></span>
            </div>
          ) : (
            <div className="icon-wrapper error-icon-wrapper">
              <svg className="crossmark" viewBox="0 0 52 52">
                <circle
                  className="crossmark-circle"
                  cx="26"
                  cy="26"
                  r="24"
                  fill="none"
                />
                <path
                  className="crossmark-line1"
                  fill="none"
                  d="M16 16l20 20"
                />
                <path
                  className="crossmark-line2"
                  fill="none"
                  d="M36 16l-20 20"
                />
              </svg>
            </div>
          )}

          <h2 className="success-title">
            {message.includes("successfully") ? "Success!" : "Oops!"}
          </h2>
          <p className="success-message">{message}</p>

          <button
            className="success-ok-btn"
            onClick={() => setOpenSuccessDialog(false)}
          >
            OK
          </button>
        </div>
      </Dialog>
      <form onSubmit={handleSubmit} className="form-container">
        <h2>New Quiz</h2>
        <fieldset className="form-section-cq">
          <div className="form-col-cq">
            <div className="form-group-cq">
              <label htmlFor="testname">Quiz Name</label>
              <input
                type="text"
                name="testname"
                value={formData.testname}
                onChange={handleChange}
                required
              />
              <ErrorMessage field="testname" />
            </div>
            <div className="form-group-cq">
              <label htmlFor="testdesc">Quiz Description</label>
              <textarea
                name="testdesc"
                value={formData.testdesc}
                onChange={handleDescriptionChange}
                rows={1}
                required
                className="testdesc-textarea"
              />
              <ErrorMessage field="testdesc" />
              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginTop: "4px",
                  textAlign: "right",
                }}
              >
                {formData.testdesc
                  ? formData.testdesc.trim().split(/\s+/).filter(Boolean).length
                  : 0}
                /20 words
              </div>
            </div>
          </div>
        </fieldset>

        <fieldset className="form-section-cq">
          <div className="form-row-cq">
            {user?.role_id != 3 && (
              <div className="form-group-cq">
                <label htmlFor="testtype">
                  Quiz Type
                  <InfoTooltip text="Quiz Type is a kind of quiz category not beyond that." />
                </label>

                <select
                  name="testtype"
                  value={formData.testtype}
                  onChange={handleChange}
                >
                  <option value="">
                    <b> Select Quiz Type </b>
                  </option>
                  <option value="General">General</option>
                  <option value="Mock">Mock</option>
                  <option value="Competitive">Competitive</option>
                  <option value="Academic">Academic</option>
                </select>
                <ErrorMessage field="testtype" />
              </div>
            )}

            <div className="form-group-cq">
              <label htmlFor="testlang">Quiz Language</label>
              <select
                name="testlang"
                value={formData.testlang}
                onChange={handleChange}
              >
                <option value="">
                  <b> Select Quiz Language </b>
                </option>
                <option value="english">English</option>
                <option value="hindi">Hindi</option>
                <option value="both">Both English and Hindi</option>
              </select>
              <ErrorMessage field="testlang" />
            </div>
          </div>

          {user?.role_id != 3 && (
            <div className="form-row-cq">
              <div className="form-group-cq radio-group">
                <label className="radio-label">
                  Is it a paid test?
                  <InfoTooltip text="On selecting Yes students will have to pay for this quiz." />
                </label>
                <div className="radio-options">
                  <label>
                    <input
                      type="radio"
                      name="paidTest"
                      value="Yes"
                      checked={formData.paidTest === "Yes"}
                      onChange={handleChange}
                    />
                    Yes
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="paidTest"
                      value="No"
                      checked={formData.paidTest === "No"}
                      onChange={handleChange}
                    />
                    No
                  </label>
                </div>

                {formData.paidTest === "Yes" && (
                  <>
                    <label htmlFor="testFeesValue">Fees Amount:</label>
                    <input
                      name="testFeesValue"
                      value={formData.testFeesValue}
                      onChange={handleChange}
                    />
                    <ErrorMessage field="testFeesValue" />
                  </>
                )}
              </div>
            </div>
          )}

          <div className="form-row-cq">
            <div className="form-group-cq">
              <label htmlFor="startDateTime">
                Starting Date & Time
                <InfoTooltip text="Quiz will be live so candidate can start giving quiz from this date and time." />
              </label>

              <input
                type="datetime-local"
                name="startDateTime"
                value={formData.startDateTime}
                onChange={handleChange}
              />
              <ErrorMessage field="startDateTime" />
              <label htmlFor="startDateTime"></label>
            </div>
            <div className="form-group-cq">
              <label htmlFor="endDateTime">
                Ending Date & Time
                <InfoTooltip text="Quiz will expire at this date and time so candidate cannot give quiz after this." />
              </label>
              <input
                type="datetime-local"
                name="endDateTime"
                value={formData.endDateTime}
                onChange={handleChange}
              />
              <ErrorMessage field="endDateTime" />
            </div>
          </div>

          <div className="form-col-cq">
            <div className="form-group-cq">
              <label htmlFor="testduration">Quiz Duration (in minutes)</label>
              <input
                name="testduration"
                type="number"
                placeholder="Duration(in minutes)"
                value={formData.testduration}
                onChange={handleChange}
                required
              />
              <ErrorMessage field="testduration" />
            </div>

            {user?.role_id != 3 && (
              <div className="form-group-cq radio-group">
                <label className="radio-label">Quiz Visibility</label>
                <div className="radio-options">
                  <label>
                    <input
                      type="radio"
                      name="testVisibility"
                      value="Global"
                      checked={formData.testVisibility === "Global"}
                      onChange={handleVisibilityChange}
                    />{" "}
                    Global
                    <InfoTooltip text="Global quiz will be visible to all the candidates." />
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="testVisibility"
                      value="Institution"
                      checked={formData.testVisibility === "Institution"}
                      onChange={handleVisibilityChange}
                    />{" "}
                    Institution
                    <InfoTooltip text="Institutional quiz will be visible to the corresponding Institutional candidates." />
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="testVisibility"
                      value="Interest"
                      checked={formData.testVisibility === "Interest"}
                      onChange={handleVisibilityChange}
                    />{" "}
                    Interest Area
                    <InfoTooltip text="Quiz based on interest will be visible to the candidates having corresponding interest." />
                  </label>
                </div>
                <ErrorMessage field="testVisibility" />
              </div>
            )}
          </div>

          <div className="form-row-cq">
            <div className="form-group-cq">
              {formData.testVisibility === "Institution" && (
                <>
                  <label>Institution Type:</label>
                  <select
                    name="institutionType"
                    value={formData.institutionType}
                    onChange={handleChange}
                  >
                    <option value=""> Select Institute Type </option>
                    <option value="School">School</option>
                    <option value="College">College</option>
                    <option value="University">University</option>
                    <option value="Coaching">Coaching</option>
                  </select>
                </>
              )}
            </div>
          </div>

          <div className="form-row-cq">
            {formData.testVisibility === "Institution" && (
              <>
                <div className="form-group-cq">
                  <label>Institution State:</label>
                  <select name="institutionState" onChange={handleStateChange}>
                    <option value="">-- Select State --</option>
                    {states.map((state, index) => (
                      <option key={index} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group-cq">
                  <label>Institution City:</label>
                  <select
                    name="institutionCity"
                    onChange={handleDistrictChange}
                  >
                    <option value="">-- Select District --</option>
                    {districts.map((district, index) => (
                      <option key={index} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group-cq">
                  <label>Institution Name:</label>
                  <select
                    name="institutionName"
                    value={formData.institutionName}
                    onChange={handleChange}
                  >
                    <option value="">-- Select Institute --</option>
                    {institutes.map((inst, index) => (
                      <option key={index} value={inst.institute_name}>
                        {inst.institute_name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          <div className="form-row-cq">
            <div className="form-group-cq">
              {formData.testVisibility === "Institution" && (
                <>
                  <label>
                    {formData.institutionType === "School"
                      ? "Standard"
                      : formData.institutionType === "College" ||
                          formData.institutionType === "University"
                        ? "Course"
                        : "Standard"}
                    :
                  </label>

                  <select name="standard_type" onChange={handleChange}>
                    <option value="">
                      {formData.institutionType === "School"
                        ? "Select Standard"
                        : formData.institutionType === "College" ||
                            formData.institutionType === "University"
                          ? "Select Course"
                          : "Select"}
                    </option>

                    {standardData?.map((item) => (
                      <option key={item.standard_id} value={item.item_name}>
                        {item.item_name}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>
          </div>

          <div className="form-group-cq">
            {formData.testVisibility === "Interest" && (
              <>
                <label>Interest Area:</label>
                <select
                  name="interestArea"
                  value={formData.interestArea}
                  onChange={handleChange}
                >
                  <option value="">Select Interest Area</option>

                  {interests.map((interest) => (
                    <option
                      key={interest.interest_id}
                      value={interest.interest_id}
                    >
                      {interest.interest_name}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>

          <div className="form-row-cq">
            <div className="form-group-cq radio-group">
              <label className="radio-label">Result Release Date</label>
              <div className="radio-options">
                <label>
                  <input
                    type="radio"
                    name="resultRelease"
                    value="Yes"
                    checked={formData.resultRelease === "Yes"}
                    onChange={handleResultReleaseDateChange}
                  />
                  Release After Quiz Expire
                  <InfoTooltip text="Candidates will get result of quiz after evaluation of quiz." />
                </label>

                <label>
                  <input
                    type="radio"
                    name="resultRelease"
                    value="No"
                    checked={formData.resultRelease === "No"}
                    onChange={handleResultReleaseDateChange}
                  />
                  Choose Release Date
                  <InfoTooltip text="Candidates will get result of quiz at the chosen release date." />
                </label>
              </div>

              {formData.resultRelease === "No" && (
                <div className="form-group-cq">
                  <input
                    type="datetime-local"
                    name="resultReleaseDate"
                    value={formData.resultReleaseDate}
                    min={getMinimumReleaseDate()}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        resultReleaseDate: e.target.value,
                      }))
                    }
                  />
                </div>
              )}
            </div>
          </div>

          <div className="form-row-cq">
            <div className="form-group-cq">
              <label>Passing Marks:</label>
              <input
                name="cutoffmarks"
                type="number"
                value={formData.cutoffmarks}
                onChange={handleChange}
                required
              />
              <ErrorMessage field="cutoffmarks" />
            </div>
          </div>

          {user?.role_id === 3 && (
            <div className="form-row-cq">
              <div className="form-group-cq">
                <label>
                  {typeVal === "School"
                    ? "Standard"
                    : typeVal === "College" || typeVal === "University"
                      ? "Course"
                      : typeVal === "Coaching"
                        ? "Exam"
                        : "Standard"}
                  :
                </label>

                <select
                  name="standard_type"
                  value={formData.standard_type}
                  onChange={handleChange}
                >
                  <option value="">
                    {typeVal === "School"
                      ? "Select Standard"
                      : typeVal === "College" || typeVal === "University"
                        ? "Select Course"
                        : typeVal === "Coaching"
                          ? "Select Exam"
                          : "Select"}
                  </option>

                  {standardData?.map((item) => (
                    <option key={item.standard_id} value={item.item_name}>
                      {item.item_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {(user?.role_id === 3 ||
            formData.testVisibility === "Institution") && (
            <div className="form-group-cq">
              <label htmlFor="logoUpload">Upload Institution Logo:</label>
              <input
                type="file"
                id="logoUpload"
                accept="image/*"
                onChange={handleLogoUpload}
                ref={fileInputRef}
              />
              <span style={{ fontSize: "12px", color: "#666" }}>
                (Max 500KB, exactly 300×300px, JPG/PNG)
              </span>

              {logoUploaded && (
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    className="small-preview-btn"
                    onClick={() => handleShowPreview("report")}
                  >
                    Preview Test Report
                  </button>
                  <button
                    type="button"
                    className="small-preview-btn"
                    onClick={() => handleShowPreview("certificate")}
                  >
                    Preview Certificate
                  </button>
                  <button
                    type="button"
                    className="small-preview-btn"
                    onClick={handleCancelUpload}
                  >
                    Cancel Upload
                  </button>
                </div>
              )}
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
          <br></br>
          <div className="file-upload-section">
            <div className="form-row-cq">
              {/* English Files */}
              {(formData.testlang === "english" ||
                formData.testlang === "both") && (
                <>
                  <div className="form-group-cq">
                    <div className="file-upload-wrapper">
                      <div
                        className={`custom-file-input ${englishQuestionName ? "has-file" : ""}`}
                      >
                        <span className="file-label-text">
                          {englishQuestionName || "Upload Test Paper (English)"}
                        </span>

                        <input
                          id="eng-question-upload"
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={handleEnglishQuestionFile}
                          onClick={(e) =>
                            handleFileInputClick(e, englishQuestionName)
                          }
                        />
                        <span className="upload-icon-inside">
                          <UploadIcon />
                        </span>
                      </div>
                    </div>
                    <div className="file-upload-bottom">
                      {englishQuestionName ? (
                        <FileUploadStatus
                          onRemove={handleRemoveEnglishQuestionFile}
                        />
                      ) : (
                        <ErrorMessage field="englishQuestionFile" />
                      )}
                      <DownloadSampleLink
                        onClick={() =>
                          downloadFile("sample_eng_question_paper.xlsx")
                        }
                      />
                    </div>
                  </div>

                  <div className="form-group-cq">
                    <div className="file-upload-wrapper">
                      <div
                        className={`custom-file-input ${englishAnswerName ? "has-file" : ""}`}
                      >
                        <span className="file-label-text">
                          {englishAnswerName || "Upload Answer Sheet (English)"}
                        </span>

                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={handleEnglishAnswerFile}
                          onClick={(e) =>
                            handleFileInputClick(e, englishAnswerName)
                          }
                        />

                        <span className="upload-icon-inside">
                          <UploadIcon />
                        </span>
                      </div>
                    </div>
                    <div className="file-upload-bottom">
                      {englishAnswerName ? (
                        <FileUploadStatus
                          onRemove={handleRemoveEnglishAnswerFile}
                        />
                      ) : (
                        <ErrorMessage field="englishAnswerFile" />
                      )}
                      <DownloadSampleLink
                        onClick={() =>
                          downloadFile("sample_eng_answer_sheet.xlsx")
                        }
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Hindi Files */}
              {(formData.testlang === "hindi" ||
                formData.testlang === "both") && (
                <>
                  <div className="form-group-cq">
                    <div className="file-upload-wrapper">
                      <div
                        className={`custom-file-input ${hindiQuestionName ? "has-file" : ""}`}
                      >
                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={handleHindiQuestionFile}
                          onClick={(e) =>
                            handleFileInputClick(e, hindiQuestionName)
                          }
                        />
                        <span className="file-label-text">
                          {hindiQuestionName || "Upload Test Paper (Hindi)"}
                        </span>
                        <span className="upload-icon-inside">
                          <UploadIcon />
                        </span>
                      </div>
                    </div>
                    <div className="file-upload-bottom">
                      {hindiQuestionName ? (
                        <FileUploadStatus
                          onRemove={handleRemoveHindiQuestionFile}
                        />
                      ) : (
                        <ErrorMessage field="hindiQuestionFile" />
                      )}
                      <DownloadSampleLink
                        onClick={() =>
                          downloadFile("sample_hin_question_paper.xlsx")
                        }
                      />
                    </div>
                  </div>

                  <div className="form-group-cq">
                    <div className="file-upload-wrapper">
                      <div
                        className={`custom-file-input ${hindiAnswerName ? "has-file" : ""}`}
                      >
                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={handleHindiAnswerFile}
                          onClick={(e) =>
                            handleFileInputClick(e, hindiAnswerName)
                          }
                        />
                        <span className="file-label-text">
                          {hindiAnswerName || "Upload Answer Sheet (Hindi)"}
                        </span>
                        <span className="upload-icon-inside">
                          <UploadIcon />
                        </span>
                      </div>
                    </div>
                    <div className="file-upload-bottom">
                      {hindiAnswerName ? (
                        <FileUploadStatus
                          onRemove={handleRemoveHindiAnswerFile}
                        />
                      ) : (
                        <ErrorMessage field="hindiAnswerFile" />
                      )}
                      <DownloadSampleLink
                        onClick={() =>
                          downloadFile("sample_hin_answer_sheet.xlsx")
                        }
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </fieldset>
        <div className="form-actions">
          <button type="submit" className="submit-excelUploader">
            Publish Test
          </button>

          {formData.testlang === "hindi" && (
            <button
              type="button"
              className="preview-btn"
              onClick={() => handlePreview()}
              disabled={
                !formData.hindiQuestionFile || !formData.hindiAnswerFile
              }
            >
              Preview Test
            </button>
          )}

          {formData.testlang === "english" && (
            <button
              type="button"
              className="preview-btn"
              onClick={() => handlePreview()}
              disabled={
                !formData.englishQuestionFile || !formData.englishAnswerFile
              }
            >
              Preview Test
            </button>
          )}

          {formData.testlang === "both" && (
            <>
              <button
                type="button"
                className="preview-btn"
                onClick={() => handlePreview("english")}
                disabled={
                  !formData.englishQuestionFile || !formData.englishAnswerFile
                }
              >
                Preview English Test
              </button>

              <button
                type="button"
                className="preview-btn"
                onClick={() => handlePreview("hindi")}
                disabled={
                  !formData.hindiQuestionFile || !formData.hindiAnswerFile
                }
              >
                Preview Hindi Test
              </button>
            </>
          )}

          <button
            type="button"
            className="reset-btn"
            onClick={() => {
              setFormData({
                testname: "",
                testdesc: "",
                testtype: "",
                testlang: "",
                testduration: "",
                maxmarks: "",
                cutoffmarks: "",
                startDateTime: "",
                endDateTime: "",
                paidTest: "No",
                testFeesValue: null,
                scheduleTest: "No",
                testVisibility: "Global",
                institutionType: "",
                standard_type: null,
                institutionState: "",
                institutionCity: "",
                institutionName: "",
                interestArea: "",
                englishQuestionFile: null,
                englishAnswerFile: null,
                hindiQuestionFile: null,
                hindiAnswerFile: null,
              });
              setQuestionOptionsList([]);
            }}
          >
            Reset Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExcelUploader;

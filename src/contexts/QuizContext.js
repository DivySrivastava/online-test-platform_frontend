import React, { createContext, useState } from "react";

export const QuizContext = createContext();

const initialFormData = {
    testname: "",
    testdesc: "",
    testtype: "",
    testVisibility: "Global",

    institutionType: "",
    institutionState: "",
    institutionCity: "",
    instituteId: "",

    interestArea: "",

    teststartdate: "",
    testenddate: "",
    testduration: "",

    maxmarks: "",
    passingmarks: "",
    testfees: "",

    standardtype: "",
    testlang: "",

    reportcard_type: "",
    certificate_type: "",

    resultReleaseDate: "",
    resultRelease: "Yes",
    paidTest: "No",
};

export const QuizProvider = ({ children }) => {
    const [formData, setFormData] = useState(initialFormData);

    const [englishQuestionOptionsList, setEnglishQuestionOptionsList] = useState([]);
    const [hindiQuestionOptionsList, setHindiQuestionOptionsList] = useState([]);
    const [questionOptionsList, setQuestionOptionsList] = useState([]);
    const [data, setData] = useState([]);

    const resetQuiz = () => {
        setFormData(initialFormData);
        setEnglishQuestionOptionsList([]);
        setHindiQuestionOptionsList([]);
        setQuestionOptionsList([]);
        setData([]);
    };

    return (
        <QuizContext.Provider
            value={{
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
            }}
        >
            {children}
        </QuizContext.Provider>
    );
};
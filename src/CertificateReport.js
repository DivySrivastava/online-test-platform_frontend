import React, { useState, forwardRef, useImperativeHandle } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "./fonts/KabinettFraktur-bold";

const CertificateReport = forwardRef((props, ref) => {
  const [loading, setLoading] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;
  useImperativeHandle(ref, () => ({
    generateParticipationCertificate,
    generateAchievementCertificate,
    generateReport,
  }));

  function getUnicodeOrdinalSuffix(n) {
    const j = n % 10, k = n % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  }

  function toTitleCasePreserveCommas(str) {
    return str
      .split(",")
      .map(part =>
        part
          .trim()
          .split(" ")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" ")
      )
      .join(", ");
  }


  function getStandardString(rawType) {
    const stdType = parseInt(rawType);

    if (!isNaN(stdType) && stdType >= 1 && stdType <= 12) {
      const suffix = getUnicodeOrdinalSuffix(stdType);
      return `${stdType}${suffix} standard at`;  // e.g., "2ⁿᵈ standard"
    } else if (typeof rawType === "string") {
      return rawType + " at";  // e.g., "ABC"
    } else {
      return "Standard not specified";
    }
  }

  function truncateMeaningfully(str, maxLength = 35) {
    if (str.length <= maxLength) return str;

    // Trim the string to the maxLength
    let trimmed = str.slice(0, maxLength);

    // Find the last space within the trimmed part
    let lastSpace = trimmed.lastIndexOf(" ");


    // If space exists, slice up to that word, else just trim as-is
    return lastSpace > 0 ? trimmed.slice(0, lastSpace) : trimmed;
  }

  const generateParticipationCertificate = async (certificateData) => {
    try {
      const response = await fetch(`${API_URL}/cert-repo/generate-participation-certificate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          test_id: certificateData.test_id,
          name: certificateData.student_name,
          test_name: certificateData.test_name,
          standard: certificateData.standard,
          institute: certificateData.institute_data,
          test_date: certificateData.test_date
          //institute: "ABC Institute of Technology, Kanpur Nagar, Uttar Pradesh",
        }),
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      // const link = document.createElement("a");
      // link.href = url;
      // link.download = "certificate.pdf";
      // link.click();
      // 👉 Open in new tab
      window.open(url, "_blank");
    } catch (err) {
      console.error("Error generating certificate:", err);
    }
  };



  const generateAchievementCertificate = async (certificateData) => {
    try {
      const response = await fetch(`${API_URL}/cert-repo/generate-achievement-certificate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // body: JSON.stringify({
        //   name: certificateData.student_name,
        //   test_name: certificateData.test_name,
        //   standard: certificateData.standard,
        //   institute: certificateData.institute_data,
        //   test_date: certificateData.test_date
        //   //institute: "ABC Institute of Technology, Kanpur Nagar, Uttar Pradesh",
        // }),
        body: JSON.stringify({
          test_id: certificateData.test_ID,
          test_name: certificateData.test_name,
          user_id: certificateData.user_ID,
          test_date: certificateData.test_date
          //institute: "ABC Institute of Technology, Kanpur Nagar, Uttar Pradesh",
        }),
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      // const link = document.createElement("a");
      // link.href = url;
      // link.download = "certificate.pdf";
      // link.click();
      // 👉 Open in new tab
      window.open(url, "_blank");
    } catch (err) {
      console.error("Error generating certificate:", err);
    }
  };

  // const generateReport = async (reportData) => {
  //   const response = await axios.get('http://localhost:5000/generate-report?name=Rajeev Kumar&score=87', {
  //     responseType: 'blob',
  //   });

  //   const url = window.URL.createObjectURL(new Blob([response.data]));
  //   const link = document.createElement('a');
  //   link.href = url;
  //   link.setAttribute('download', 'Rajeev-Kumar-Report.pdf');
  //   document.body.appendChild(link);
  //   link.click();
  //   link.remove();
  // };

  const generateReport = async (reportData) => {
    try {
      const response = await fetch(`${API_URL}/cert-repo/generate-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          test_id: reportData.test_ID,
          user_id: reportData.user_ID,
          test_name: reportData.test_name,
          test_date: reportData.test_date,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Open PDF in new tab
      window.open(url, "_blank");
    } catch (err) {
      console.error("Error generating report:", err);
    }
  };




  // const response = await axios.get('http://localhost:5000/generate-report', {
  //   responseType: 'blob',
  // });

  // const blob = new Blob([response.data], { type: 'application/pdf' });
  // const url = window.URL.createObjectURL(blob);

  // // Open in a new tab
  // window.open(url, '_blank');




  // const generateCertificate = async (user, institute, test_name, rank = 0) => {

  //     try {
  //     const response = await fetch("http://localhost:5000/generate-certificate", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         name: "Ramu",
  //         score: 95,
  //         testName: "Final Test",
  //         date: "2025-06-21",
  //       }),
  //     });

  //     const blob = await response.blob();
  //     const url = window.URL.createObjectURL(blob);
  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.download = "certificate.pdf";
  //     link.click();
  //   } catch (err) {
  //     console.error("Error generating certificate:", err);
  //   }
  // setLoading(true);
  // try {
  //   // Fetch certificate image as base64 from backend
  //   const response = await axios.get(`http://localhost:5000/get-certificate-template/${rank}`);


  //   const base64Image = response.data.image;

  //   const img = new Image();
  //   img.crossOrigin = 'anonymous';
  //   img.src = `data:image/png;base64,${base64Image}`;

  //   img.onload = () => {
  //     const pdf = new jsPDF('landscape', 'px', 'a4');

  //     // Add background certificate image
  //     pdf.addImage(img, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());

  //     // Overlay student details – adjust positions if needed
  //     pdf.setFont("times", "bold");
  //     pdf.setTextColor('#000');
  //     //NGO Title 
  //     pdf.setFontSize(24);        
  //     pdf.text(`Society for Animal Health Agriculture Science and Humanity`, 310, 130, { align: 'center' });

  //     //NGO Address 
  //     pdf.setFontSize(19);        
  //     pdf.text(`Munshiganj, Post-H.A.L. Korwa District-Amethi -227412`, 320, 150, { align: 'center' });

  //     pdf.setFontSize(15);        
  //     pdf.text(`Affiliated`, 310, 165, { align: 'center' });

  //     pdf.setFontSize(20);        
  //     pdf.text(`Nehru Yuva Kendra Amethi U.P.`, 325, 185, { align: 'center' });

  //     pdf.setFontSize(12);        
  //     pdf.text(`Ministry of Youth Affairs and Sports, Govt. of India`, 325, 200, { align: 'center' });

  //     pdf.setFont("KabinettFraktur", "bold");
  //     pdf.setFontSize(20);

  //     if(rank === 0){
  //       pdf.text(`Certificate of Participation`, 310, 233, { align: 'center' });
  //       pdf.setFont("times", "normal");
  //       pdf.setFontSize(19);
  //       pdf.text(`This participation certificate is proudly awarded to`, 322, 260, { align: 'center' });
  //     }
  //     else{
  //       pdf.text(`Certificate of Achievement`, 310, 233, { align: 'center' });
  //       pdf.setFont("times", "normal");
  //       pdf.setFontSize(19);
  //       pdf.text(`This achievement certificate is proudly awarded to`, 322, 260, { align: 'center' });
  //     }


  //     //Student Name
  //     pdf.setFont("times", "bold");
  //     pdf.setFontSize(22);
  //     pdf.text(`${user.name}`, 310, 275, { align: 'center' });

  //     if(institute === null){

  //         pdf.setFont("times", "normal");
  //         pdf.setFontSize(17);
  //       if(rank === 0){            
  //         pdf.text(`who participated in the test`, 310, 290, { align: 'center' });
  //       }
  //       else{         
  //         const suffix = getUnicodeOrdinalSuffix(rank);   
  //         pdf.text(`who secured ${rank}${suffix} position in the test`, 310, 290, { align: 'center' });
  //       }


  //       pdf.setFont("times", "bold");
  //       pdf.setFontSize(17);
  //       pdf.text(`${test_name}`, 314, 305, { align: 'center' });

  //       pdf.setFont("times", "normal");
  //       pdf.setFontSize(17);  
  //       pdf.text(`organized by our NGO on 8 March 2025.`, 305, 323, { align: 'center' });
  //     }
  //     else{

  //       //let standardString = getStandardString(user.standard_type);
  //       let standardString = getStandardString(user.standard_type);

  //       pdf.setFont("times", "normal");
  //       pdf.setFontSize(17);
  //       pdf.text(`student of ${standardString}`, 310, 290, { align: 'center' });


  //       let displayInstitute = truncateMeaningfully(institute.institute_name);

  //       displayInstitute = `${displayInstitute},${institute.institute_type},${institute.institute_city},${institute.institute_state}`;
  //       displayInstitute =  toTitleCasePreserveCommas(displayInstitute);

  //       pdf.setFont("times", "bold");
  //       pdf.setFontSize(16);
  //       pdf.text(`${displayInstitute}`, 310  , 305, { align: 'center' });

  //       pdf.setFont("times", "normal");
  //       pdf.setFontSize(17);
  //       pdf.text(`who participated in the test`, 310, 320, { align: 'center' });

  //       pdf.setFont("times", "bold");
  //       pdf.setFontSize(17);
  //       pdf.text(`${test_name}`, 314, 335, { align: 'center' });

  //       pdf.setFont("times", "normal");
  //       pdf.setFontSize(17);  
  //       pdf.text(`organized by our NGO on 8 March 2025.`, 305, 348, { align: 'center' });

  //     }

  //     // Save the PDF
  //     //pdf.save(`${studentName}-certificate.pdf`);
  //     window.open(pdf.output('bloburl'));
  //     setLoading(false);
  //   };

  //   img.onerror = () => {
  //     setLoading(false);
  //     alert("Failed to load certificate image.");
  //   };
  // } catch (error) {
  //   setLoading(false);
  //   console.error('Error generating certificate:', error);
  //   alert("Something went wrong while generating the certificate.");
  // }
  // };



  return <div></div>;
});

export default CertificateReport;

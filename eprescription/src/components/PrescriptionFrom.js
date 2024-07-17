import React, { useState, useEffect } from 'react';
import { db } from '../services/Firebase';
import { stg } from '../services/Firebase';
import { ref, get, set, update } from 'firebase/database';
import { getStorage,uploadBytes, getDownloadURL, ref as Refstg } from 'firebase/storage';
import { useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './index.css'
import axios from 'axios';


const PrescriptionForm = () => {
  // useLocation hook from react-router-dom to access the state passed during navigation.
  const location = useLocation();
  const [doctorDetails, setDoctorDetails] = useState(location.state.doctorDetails || {
    name: '',
    specialization: '',
    number: ''
  });
  const [prescriptions, setPrescriptions] = useState([
    {
      medicine: '',
      morning: '0',
      afternoon: '0',
      evening: '0',
      night: '0',
      bf: false,
      af: false,
      duration: '',
    },
  ]);

  const [patientDetails, setPatientDetails] = useState({
    name: '',
    gender: '',
    age: '',
  });
  const [patientID, setPatientID] = useState('');
  
  const addRow = () => {
    setPrescriptions([...prescriptions, { medicine: '', morning: '0', afternoon: '0', evening: '0', night: '0', bf: false, af: false, duration: '' }]);
  };

  const deleteRow = (index) => {
    const updatedPrescriptions = [...prescriptions];
    updatedPrescriptions.splice(index, 1);
    setPrescriptions(updatedPrescriptions);
  };

  const handleInputChange = (index, field, value) => {
    const updatedPrescriptions = [...prescriptions];
    updatedPrescriptions[index][field] = value;
    setPrescriptions(updatedPrescriptions);
  };
   
  const handleDoctorInputChange = (field, value) => {
    setDoctorDetails({ ...doctorDetails, [field]: value });
  };
  
  
  const handlePatientSearch = async () => {
    const patientRef = ref(db, `patients/${patientID}`);
    try {
      const snapshot = await get(patientRef);
      if (snapshot.exists()) {
        const patientData = snapshot.val();
        setPatientDetails({
          name: patientData.name || '',
          gender: patientData.gender || '',
          age: patientData.age || '',
        });
      } else {
        // Handle case when patient ID doesn't exist
        setPatientDetails({
          name: 'Not found',
          gender: '',
          age: '',
        });
      }
    } catch (error) {
      console.error('Error fetching patient details:', error);
    }
  };

  // store prescription from
  const calculateCount = (prescription) => {
    const { morning, afternoon, evening, night, duration } = prescription;
    const morningInt = parseInt(morning) || 0;
    const afternoonInt = parseInt(afternoon) || 0;
    const eveningInt = parseInt(evening) || 0;
    const nightInt = parseInt(night) || 0;
    const daysInt = parseInt(duration) || 0;
    return daysInt * (morningInt + afternoonInt + eveningInt + nightInt);
  };

 

  const handlePrescriptionSubmit = async (event) => {
    event.preventDefault();
    const prescriptionsRef = ref(db, `prescriptions/${patientID}/Details`);
  
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  
    // Construct the prescription data object
    const prescriptionData = {
      age: patientDetails.age,
      gender: patientDetails.gender,
      name: patientDetails.name,
    };
  
    // Fetch existing prescription data if any
    const snapshot = await get(prescriptionsRef);
    if (snapshot.exists()) {
      Object.assign(prescriptionData, snapshot.val());
    }
  
    // Initialize or update the medicine details for the current date
    prescriptionData[formattedDate] = prescriptionData[formattedDate] || {};
  
    for (const prescription of prescriptions) {
      const count = calculateCount(prescription);
      const medication = {
        Morning: prescription.morning,
        Afternoon: prescription.afternoon,
        Evening: prescription.evening,
        Night: prescription.night,
        BF_AF: prescription.bf ? ['BF'] : [],
        Duration: prescription.duration,
        Count: count,
      };
  
      // Add or update the medication details for the current date
      prescriptionData[formattedDate][prescription.medicine] = medication;
    }
  
    // Save the updated prescription data under the patient ID
    try {
      // Save the updated prescription data under the patient ID
      await set(prescriptionsRef, prescriptionData);
      console.log('Prescription stored successfully');
  
      // Clear the prescription form after submission
      setPrescriptions([]);
      setPatientDetails({ name: '', gender: '', age: '' });
    } catch (error) {
      console.error('Error storing prescription:', error);
    }
  };
  

  
  const generateAndSendPDF = async () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');

    const pageTitle = 'MediTrack+';
    const pageWidth = doc.internal.pageSize.getWidth();
    const textWidth = doc.getStringUnitWidth(pageTitle) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    const xPosition = (pageWidth - textWidth) / 2;
    doc.text(xPosition, 10, pageTitle);
    doc.setFont('helvetica', 'normal');

    doc.setTextColor(0, 0, 255);
    doc.text(20, 20, 'Doctor Details:');
    doc.setTextColor(0);
    doc.text(20, 30, `Doctor: ${doctorDetails.name}`);
    doc.text(20, 40, `Doctor Specialization: ${doctorDetails.specialization}`);
    doc.text(20, 50, `Doctor Contact Number: ${doctorDetails.number}`);

    doc.setTextColor(0, 0, 255);
    doc.text(20, 70, 'Patient Details:');
    doc.setTextColor(0);
    doc.text(20, 80, `Patient: ${patientDetails.name}`);
    doc.text(20, 90, `Patient Gender: ${patientDetails.gender}`);
    doc.text(20, 100, `Patient Age: ${patientDetails.age}`);

    doc.setTextColor(0, 0, 255);
    doc.text(20, 120, 'Prescription Form:');
    doc.setTextColor(0);

    const headers = ['Medicine', 'Morning', 'Afternoon', 'Evening', 'Night', 'BF/AF', 'Duration'];
    const data = prescriptions.map(({ medicine, morning, afternoon, evening, night, bf, af, duration }) => [
      medicine, morning, afternoon, evening, night, (bf || af) ? (bf && af ? 'BF AF' : bf ? 'BF' : 'AF') : '', duration
    ]);

    const tableStyles = {
      textColor: [0, 0, 255],
      fontSize: 12,
      fontStyle: 'bold',
      fillColor: [240, 240, 240]
    };

    const headerStyles = {
      textColor: [255, 255, 255],
      fillColor: [0, 204, 255]
    };

    doc.autoTable({ startY: 130, head: [headers], body: data, theme: 'grid', tableStyles, headStyles: headerStyles });

    const pdfData = doc.output('blob');
    
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Adding 1 to month because it's zero-based
    const day = String(currentDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

  

    function generateUniqueID() {
      const now = new Date();
      const timestamp = now.getTime(); // Get the current timestamp in milliseconds
      return `prescription_${timestamp}`;
    }

    const PrescriptionName = generateUniqueID();
  
    // Save the PDF to a storage location (example: Firebase Storage)
    try {
      const storageRef = Refstg(stg, `prescriptions/${patientID}/${dateString}/${PrescriptionName}.pdf`);
      await uploadBytes(storageRef, pdfData);
      const pdfURL = await getDownloadURL(storageRef);
  
      // Retrieve the patient's phone number from the database
      const patientRef = ref(db, `patients/${patientID}`);
      const snapshot = await get(patientRef);
      if (snapshot.exists()) {
          const patientData = snapshot.val();
          const patientNumber = patientData.contact_number; // Assuming phone number is stored in the database
          if (patientNumber) {
              // Send the PDF URL to the patient's phone number via SMS using Twilio
              try {
                const response = await axios.post('http://localhost:8000/api/send-pdf', {
                  patientNumber,
                  pdfURL,
                    // Add any other necessary data you want to send to Django
                });
                console.log('Response from Django:', response.data);
            } catch (error) {
                console.error('Error sending PDF URL to Django:', error);
            }
          } else {
              console.error('Patient phone number not found in database.');
          }
      } else {
          console.error('Patient data not found in database.');
      }
  
      console.log('PDF URL:', pdfURL);
  } catch (error) {
      console.error('Error saving PDF:', error);
  }

 };

    

 return (
    <div className="prescription-page">
    
    <div className="card">
      <h2>Doctor Details</h2>
      <div className="input-group">
        <label>Name:</label>
        <input
          type="text"
          value={doctorDetails.name}
          onChange={e => handleDoctorInputChange('name', e.target.value)}
          disabled
        />
      </div>
      <div className="input-group">
        <label>Specialization:</label>
        <input
          type="text"
          value={doctorDetails.specialization}
          onChange={e =>
            handleDoctorInputChange('specialization', e.target.value)
          }
          disabled
        />
      </div>
      <div className="input-group">
        <label>Number:</label>
        <input
          type="text"
          value={doctorDetails.number}
          onChange={e => handleDoctorInputChange('number', e.target.value)}
          disabled
        />
      </div>
    </div>

    <div className="card">
      <h2>Patient Details</h2>
      <div className="input-group">
        <input
          type="text"
          placeholder="Enter patient ID"
          value={patientID}
          onChange={e => setPatientID(e.target.value)}
        />
        <br />
        <button type='submit' onClick={handlePatientSearch}>Search</button>
      </div>
      <div className="input-group">
        <label>Name:</label>
        <input type="text" value={patientDetails.name} disabled />
      </div>
      <div className="input-group">
        <label>Gender:</label>
        <input type="text" value={patientDetails.gender} disabled />
      </div>
      <div className="input-group">
        <label>Age:</label>
        <input type="text" value={patientDetails.age} disabled />
      </div>
    </div>

    <div className="card">
      <h2>Prescription Form</h2>
      <table>
        <thead>
          <tr>
            <th>Medicine</th>
            <th>Morning</th>
            <th>Afternoon</th>
            <th>Evening</th>
            <th>Night  </th>
            <th>BF/AF</th>
            <th>Duration</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {prescriptions.map((prescription, index) => (
            <tr key={index}>
              <td>
                <input
                  type="text"
                  value={prescription.medicine}
                  onChange={e =>
                    handleInputChange(index, 'medicine', e.target.value)
                  }
                />
              </td>
              <td>
                <select
                  value={prescription.morning}
                  onChange={e =>
                    handleInputChange(index, 'morning', e.target.value)
                  }
                >
                  <option value="0">0</option>
                  <option value="1">1</option>
                </select>
              </td>
              <td>
                <select
                  value={prescription.afternoon}
                  onChange={e =>
                    handleInputChange(index, 'afternoon', e.target.value)
                  }
                >
                  <option value="0">0</option>
                  <option value="1">1</option>
                </select>
              </td>
              <td>
                <select
                  value={prescription.evening}
                  onChange={e =>
                    handleInputChange(index, 'evening', e.target.value)
                  }
                >
                  <option value="0">0</option>
                  <option value="1">1</option>
                </select>
              </td>
              <td>
                <select
                  value={prescription.night}
                  onChange={e =>
                    handleInputChange(index, 'night', e.target.value)
                  }
                >
                  <option value="0">0</option>
                  <option value="1">1</option>
                </select>
              </td>
              <td>
                <input
                  type="checkbox"
                  value="BF"
                  checked={prescription.bf}
                  onChange={e =>
                    handleInputChange(index, 'bf', e.target.checked)
                  }
                />
                <span>BF</span>
                <br />
                <input
                  type="checkbox"
                  value="AF"
                  checked={prescription.af}
                  onChange={e =>
                    handleInputChange(index, 'af', e.target.checked)
                  }
                />
                <span>AF</span>
              </td>
              <td>
                <input
                  type="text"
                  value={prescription.duration}
                  onChange={e =>
                    handleInputChange(index, 'duration', e.target.value)
                  }
                />
              </td>
              <td>
                <button onClick={() => deleteRow(index)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
      <button onClick={addRow}>Add Row</button>
      <center><button onClick={(event) => { handlePrescriptionSubmit(event); generateAndSendPDF(); }}>Submit Prescription</button>
      </center>
      </div>
      </div>
    
    
  </div>
);

};

export default PrescriptionForm;

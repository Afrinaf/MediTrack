import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { db } from '../services/Firebase'; // Import Firebase db reference
import { ref, get } from 'firebase/database';
import './index.css';

const Patientpage = () => {
  const [rfidNumber, setRfidNumber] = useState('');
  const [patientDetails, setPatientDetails] = useState(null);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    const ws = new WebSocket('ws://192.168.4.226:81');
    ws.onopen = () => {
      console.log('WebSocket connection opened');
    };
    ws.onmessage = (event) => {
      const message = event.data;
      if (message.startsWith('RFID:')) {
        const tagNumber = message.substring(5);
        setRfidNumber(tagNumber);
      }
    };
    ws.onerror = (error) => {
      console.error('WebSocket connection error:', error);
    };
    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      ws.close();
    };
  }, []);

  const fetchPatientDetails = (patientId) => {
    const dt = ref(db, `prescriptions/${patientId}`);
    get(dt)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const patientData = snapshot.val();
          console.log('Patient data fetched:', patientData);
          setPatientDetails(patientData);
        } else {
          console.error('No data available for the specified patient ID.');
        }
      })
      .catch((error) => {
        console.error('Error fetching patient details:', error);
      });
  };

  const handleDateFilter = () => {
    if (selectedDate && patientDetails && patientDetails['Details']) {
      const prescriptions = patientDetails['Details'][selectedDate] || {};
      console.log('Filtered prescriptions:', prescriptions);
      setFilteredPrescriptions(Object.entries(prescriptions));
    } else {
      console.log("No data found for the selected date");
      setFilteredPrescriptions([]);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date ? date.toISOString().split('T')[0] : '');
  };

  const handleInputChange = (event) => {
    setRfidNumber(event.target.value);
  };

  const handleSubmit = () => {
    fetchPatientDetails(rfidNumber);
  };

  return (
    <div>
      <h1>Patient Page</h1>
      <form>
        <label>
          Enter Tag Number:
          <input type="text" value={rfidNumber} onChange={handleInputChange} />
        </label>
      </form>
      <button onClick={handleSubmit}>Submit</button>
      {patientDetails && (
        <div>
          <h2>Patient Details</h2>
          <p>Patient ID: {rfidNumber}</p>
          <p>Patient Name: {patientDetails['Details']['name']}</p>
          <div>
            <h3>Filter Medical Records</h3>
            <label>
              Select Date:
              <DatePicker
                selected={selectedDate ? new Date(selectedDate) : null}
                onChange={handleDateChange}
                dateFormat="yyyy-MM-dd"
              />
            </label>
            <button onClick={handleDateFilter}>Apply Filter</button>
          </div>
          <div>
            <h3>Prescriptions</h3>
            {filteredPrescriptions && filteredPrescriptions.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Morning</th>
                    <th>Afternoon</th>
                    <th>Evening</th>
                    <th>Night</th>
                    <th>Count</th>
                    <th>Duration</th>
                    <th>BF_AF</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrescriptions.map(([medicine, details], index) => (
                    <tr key={index}>
                      <td>{medicine}</td>
                      <td>{details.Morning}</td>
                      <td>{details.Afternoon}</td>
                      <td>{details.Evening}</td>
                      <td>{details.Night}</td>
                      <td>{details.Count}</td>
                      <td>{details.Duration}</td>
                      <td>{Array.isArray(details.BF_AF) ? details.BF_AF.join(', ') : details.BF_AF}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No prescriptions available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Patientpage;

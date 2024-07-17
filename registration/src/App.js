import React, { useState } from 'react';
import { ref, set } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

function App() {
  const firebaseConfig = {
    apiKey: "AIzaSyBUj2mbmLXiIpii7KIQDvWbSnDNFg2JjWU",
    authDomain: "eprescription-7a141.firebaseapp.com",
    projectId: "eprescription-7a141",
    storageBucket: "eprescription-7a141.appspot.com",
    messagingSenderId: "116865623448",
    appId: "1:116865623448:web:6cb5e93a2b8828af5ab7ed",
    measurementId: "G-3GWZM19068"
  };

  // Initialize Firebase
  const firebaseApp = initializeApp(firebaseConfig);

  // Reference to the database service
  const db = getDatabase(firebaseApp);

  const [formData, setFormData] = useState({
    rfid: '',
    reg_date: '', // Set your default date here
    name: '',
    age: '',
    dob: '',
    gender: '',
    address: '',
    contact_number: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    age: '',
    dob: '',
    gender: '',
    address: '',
    contact_number: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    let formIsValid = true;
    const newErrors = { ...errors };

    if (!formData.rfid) {
      newErrors.rfid = 'RFID is required';
      formIsValid = false;
    }
    if (!formData.reg_date) {
      newErrors.reg_date = 'Registration date is required';
      formIsValid = false;
    }
    if (!formData.name) {
      newErrors.name = 'Name is required';
      formIsValid = false;
    }
    if (!formData.age || isNaN(formData.age)) {
      newErrors.age = 'Valid age is required';
      formIsValid = false;
    }
    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
      formIsValid = false;
    }
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
      formIsValid = false;
    }
    if (!formData.address) {
      newErrors.address = 'Address is required';
      formIsValid = false;
    }
    if (!formData.contact_number || !/^\d{10}$/.test(formData.contact_number)) {
      newErrors.contact_number = 'Valid 10-digit contact number is required';
      formIsValid = false;
    }

    setErrors(newErrors);
    return formIsValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Save data to Realtime Database
      const patientsRef = ref(db, `patients/${formData.rfid}`);
      await set(patientsRef, formData);

      // Show success message or perform additional actions
      alert('Patient registered successfully!');
    } catch (e) {
      console.error('Error registering patient:', e);
      console.error('Error details:', e.message);
      // Handle errors, show an error message, or perform additional actions
      alert('Error registering patient. Please try again.');
    }
  };

  return (
    <div className="registration-container">
      <h2>Patient Registration</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="rfid">RFID:</label>
          <input
            type="text"
            id="rfid"
            name="rfid"
            value={formData.rfid}
            onChange={handleChange}
          />
          <div className="error-message">{errors.rfid}</div>
        </div>

        <div className="form-group">
          <label htmlFor="reg_date">Reg Date:</label>
          <input
            type="date"
            id="reg_date"
            name="reg_date"
            value={formData.reg_date}
            onChange={handleChange}
          />
          <div className="error-message">{errors.reg_date}</div>
        </div>
        
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <div className="error-message">{errors.name}</div>
        </div>

        <div className="form-group">
          <label htmlFor="age">Age:</label>
          <input
            type="text"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
          />
          <div className="error-message">{errors.age}</div>
        </div>

        <div className="form-group">
          <label htmlFor="dob">Date of Birth:</label>
          <input
            type="date"
            id="dob"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
          />
          <div className="error-message">{errors.dob}</div>
        </div>

        <div className="form-group">
          <label htmlFor="gender">Gender:</label>
          <input
            type="text"
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          />
          <div className="error-message">{errors.gender}</div>
        </div>

        <div className="form-group">
          <label htmlFor="address">Address:</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
          <div className="error-message">{errors.address}</div>
        </div>

        <div className="form-group">
          <label htmlFor="contact_number">Contact Number:</label>
          <input
            type="text"
            id="contact_number"
            name="contact_number"
            value={formData.contact_number}
            onChange={handleChange}
          />
          <div className="error-message">{errors.contact_number}</div>
        </div>
        
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default App;

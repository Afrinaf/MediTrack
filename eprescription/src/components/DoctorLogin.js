import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get, ref } from 'firebase/database';
import { db } from '../services/Firebase';
import './index2.css';


const DoctorLogin = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(''); // Added declaration of setLoginError
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const doctorRef = ref(db, 'doctors/' + userId);
      const snapshot = await get(doctorRef);
      const doctorData = snapshot.val();
      console.log(doctorData);
      if (doctorData &&  String(doctorData.password) === password) {
        // Redirect to PrescriptionForm page with doctor details as props
        navigate('/PrescriptionForm', { state: { doctorDetails: doctorData } });
      } else {
        setLoginError('Invalid user ID or password');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setLoginError('An error occurred while logging in');
    }
  };

  return (
    <div className="login-page"> {/* Add the login-page class */}
      <div className="login-card">
        <div className="login-illustration"></div> {/* Add the login-illustration class */}
        <div className="login-form">
          <h2>Doctor Login</h2>
          <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User ID" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
          <button onClick={handleLogin}>Login</button>
          {loginError && <p className="error-message">{loginError}</p>} 
        </div>
      </div>
    </div> 
 
  );
};

export default DoctorLogin;
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PrescriptionFrom from "./components/PrescriptionFrom";
import DoctorLogin from './components/DoctorLogin';
import { useNavigate } from 'react-router-dom';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<DoctorLogin />} />
          <Route path="/PrescriptionForm" element={<PrescriptionFrom />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;

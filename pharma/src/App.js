import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Patientpage from './components/Patientpage';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/patientpage" element={<Patientpage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
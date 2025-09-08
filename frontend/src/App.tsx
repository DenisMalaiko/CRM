import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './App.css';

import Home from './pages/home/home';
import SignUp from './pages/auth/signUp/SignUp';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <nav>
          <Link to="/">Home</Link> |
          <Link to="/signUp">Sign Up</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signUp" element={<SignUp />} />
        </Routes>
      </header>
    </div>
  );
}

export default App;

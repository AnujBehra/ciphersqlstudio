import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import HomePage from './pages/HomePage/HomePage';
import AssignmentPage from './pages/AssignmentPage/AssignmentPage';
import LoginPage from './pages/AuthPage/LoginPage';
import SignupPage from './pages/AuthPage/SignupPage';
import { getMe } from './services/api';
import './styles/global.scss';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getMe()
        .then((response) => setUser(response.data))
        .catch(() => {
          localStorage.removeItem('token');
        });
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <Router>
      <div className="app">
        <Header user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/assignment/:id" element={<AssignmentPage />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/signup" element={<SignupPage onLogin={handleLogin} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

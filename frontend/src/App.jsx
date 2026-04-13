import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Welcome from './pages/Welcome';
import { useEffect } from 'react';

// Background ambient elements that persist across routes
const AmbientBackground = () => (
  <>
    <div className="ambient-glow-1"></div>
    <div className="ambient-glow-2"></div>
  </>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('vpas_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  // Let's set a title
  useEffect(() => {
    document.title = "Visual Password Auth";
  }, []);

  return (
    <Router>
      <AmbientBackground />
      <div className="page-container">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/welcome" 
            element={
              <ProtectedRoute>
                <Welcome />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

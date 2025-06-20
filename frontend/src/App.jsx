import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from "./Home"
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import GlobalToastContainer from './components/GlobalToastContainer';
import { DocketProvider } from './context/DocketContext';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
      <Routes>
        {!isAuthenticated ? (
          <Route path="*" element={<Login />} />
        ) : (
          <Route path="/*" element={<Home />} />
        )}
      </Routes>
  )
}

function App() {

  return (
    
      <AuthProvider>
        <DocketProvider>
          <ThemeProvider>
              <Router>
                <GlobalToastContainer />
                <AppRoutes />
              </Router>
          </ThemeProvider>
        </DocketProvider>
      </AuthProvider>
  )
}

export default App

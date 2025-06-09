import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashbord';

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <Router>
        <div className="flex">
          <Sidebar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
          <main className="flex-1 min-h-screen bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              {/* Add more routes below as needed */}
              <Route path="/revenue" element={<div className="p-6">Revenue Page</div>} />
              <Route path="/notifications" element={<div className="p-6">Notifications</div>} />
              <Route path="/analytics" element={<div className="p-6">Analytics</div>} />
              <Route path="/likes" element={<div className="p-6">Likes</div>} />
              <Route path="/wallets" element={<div className="p-6">Wallets</div>} />
            </Routes>
          </main>
        </div>
      </Router>
    </div>
  );
}


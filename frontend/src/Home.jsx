import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashbord';

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <div className="flex">
        <Sidebar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        <main className="flex-1 min-h-screen bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            {/* Add more routes below as needed */}
            <Route path="/operation" element={<div className="p-6">operation</div>} />
            <Route path="/settings" element={<div className="p-6">settings</div>} />
            <Route path="/accounts" element={<div className="p-6">accounts</div>} />
            <Route path="/user" element={<div className="p-6">user</div>} />
            <Route path="/reports" element={<div className="p-6">reports</div>} />
            <Route path="/dashboard/overview" element={<div className="p-6">Overview</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}



import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashbord';
import CreateDocketPage from './pages/CreateDocketPage';
import GetDocket from './pages/GetDocket';
import DocketDetailPage from './pages/DocketDetailPage';
import UpdateDocketPage from './pages/UpdateDocketPage';
import Header from './components/Header';
import Profile from './pages/Profile';

export default function Home() {

  return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 min-h-screen overflow-y-auto bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
          <Header />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            {/* Add more routes below as needed */}
            <Route path="/operation" element={<div className="p-6">operation</div>} />
            <Route path="/settings" element={<div className="p-6">settings</div>} />
            <Route path="/accounts" element={<div className="p-6">accounts</div>} />
            <Route path="/user" element={<div className="p-6">user</div>} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/reports" element={<div className="p-6">reports</div>} />
            <Route path="/dashboard/docket" element={<CreateDocketPage />} />
            <Route path="/dashboard/get-docket" element={<GetDocket />} />
            <Route path="/dashboard/docket/:docketId" element={<DocketDetailPage />} />
            <Route path="/dashboard/docket/update/:docketId" element={<UpdateDocketPage />} />
          </Routes>
        </main>
      </div>
  );
}


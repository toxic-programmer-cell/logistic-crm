import React, { useState } from 'react';
import {
  HomeIcon,
  BarChartIcon,
  BellIcon,
  PieChartIcon,
  HeartIcon,
  WalletIcon,
  LogOutIcon,
  MoonIcon,
  SunIcon,
  ChevronRightIcon,
  SearchIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const navLinks = [
  { icon: <HomeIcon size={20} />, label: 'Dashboard', path: '/' },
  { icon: <BarChartIcon size={20} />, label: 'Revenue', path: '/revenue' },
  { icon: <BellIcon size={20} />, label: 'Notifications', path: '/notifications' },
  { icon: <PieChartIcon size={20} />, label: 'Analytics', path: '/analytics' },
  { icon: <HeartIcon size={20} />, label: 'Likes', path: '/likes' },
  { icon: <WalletIcon size={20} />, label: 'Wallets', path: '/wallets' },
];

export default function Sidebar({ isDarkMode, setIsDarkMode }) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <nav
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } h-screen bg-white dark:bg-gray-900 transition-all duration-300 shadow-lg flex flex-col`}
    >
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && (
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Codinglab</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Web Developer</p>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-700 dark:text-gray-300"
        >
          <ChevronRightIcon className={`${isCollapsed ? 'rotate-180' : ''} transition-transform`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-2 rounded-md mb-4 cursor-pointer">
          <SearchIcon className="text-gray-500" />
          {!isCollapsed && (
            <input
              type="text"
              placeholder="Search..."
              className="ml-2 bg-transparent outline-none w-full text-sm text-gray-700 dark:text-gray-200"
            />
          )}
        </div>

        <ul className="space-y-2">
          {navLinks.map((link, idx) => (
            <li key={idx}>
              <Link
                to={link.path}
                className="flex items-center p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                {link.icon}
                {!isCollapsed && <span className="ml-3">{link.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button className="flex items-center w-full p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 text-red-600 dark:text-red-400">
          <LogOutIcon size={20} />
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </button>

        <div className="flex items-center mt-4 justify-between">
          {!isCollapsed && (
            <span className="text-sm text-gray-700 dark:text-gray-300">Dark mode</span>
          )}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="ml-auto flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"
          >
            {isDarkMode ? <SunIcon size={16} /> : <MoonIcon size={16} />}
          </button>
        </div>
      </div>
    </nav>
  );
}

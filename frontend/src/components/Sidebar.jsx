import React, { useState } from 'react';
import {
  HomeIcon,
  BarChartIcon,
  BellIcon,
  PieChartIcon,
  SettingsIcon,
  WalletIcon,
  LogOutIcon,
  MoonIcon,
  SunIcon,
  ChevronRightIcon,
  SearchIcon,
  UserIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const navLinks = [
  { icon: <HomeIcon size={20} />, label: 'Master', path: '/',
    subLinks: [
      { label: 'Docket', path: '/dashboard/docket' },
      { label: 'Get Docket', path: '/dashboard/get-docket' },
      { label: 'System Health', path: '/dashboard/health' },
    ],
  },
  { icon: <BarChartIcon size={20} />, label: 'Operation', path: '/operation' },
  { icon: <SettingsIcon size={20} />, label: 'Settings', path: '/settings' },
  { icon: <PieChartIcon size={20} />, label: 'Accounts', path: '/accounts' },
  { icon: <UserIcon size={20} />, label: 'User', path: '/user',
    subLinks: [
      { label: 'Create User', path: '/user/create' },
    ]
  },
  { icon: <WalletIcon size={20} />, label: 'Reports', path: '/reports' },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [hoveredItemIndex, setHoveredItemIndex] = useState(null);
  const { logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <nav
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } h-screen bg-white dark:bg-gray-900 transition-all duration-300 shadow-lg flex flex-col`}
    >
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && (
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">GlobalIndiaExpress</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">International Courier</p>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-700 dark:text-gray-300"
        >
          <ChevronRightIcon className={`${isCollapsed ? 'rotate-180' : ''} transition-transform`} />
        </button>
      </div>

      <div className={`flex-1 px-2 ${!isCollapsed ? 'overflow-y-auto' : ''}`}>
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
            <li
              className='relative'
              key={idx}
              onMouseEnter={() => {
                if (link.subLinks){
                  setHoveredItemIndex(idx);
                }
              }}
              onMouseLeave={() => {
                if (link.subLinks) {
                  setHoveredItemIndex(null);
                }
              }}
            >
              <Link
                to={link.path}
                className="flex items-center p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                {link.icon}
                {!isCollapsed && <span className="ml-3">{link.label}</span>}
              </Link>

              {/* Render sub-links based on hover and collapsed state */}
              {link.subLinks && hoveredItemIndex === idx && (

              /* {link.subLinks &&
                  (hoveredItemIndex === idx ||
                    (idx === 0 && true)) && ( DEBUG: Force show sublinks for Dashboard (idx=0) for CSS adjustments */ 
              

                <>
                  {/* Sub-links for EXPANDED sidebar */}
                  {!isCollapsed && (
                    <ul className="pl-8 pt-1 pb-1 space-y-1">
                      {link.subLinks.map((subLink, subIdx) => (
                        <li key={subIdx}>
                          <Link
                            to={subLink.path}
                            className="flex items-center py-1 px-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-sm text-gray-600 dark:text-gray-400"
                          >
                            <span>{subLink.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  {/* Pop-out sub-links for COLLAPSED sidebar */}
                  {isCollapsed && (
                    <div
                      className="absolute left-[85%] ml-2 top-0 w-max bg-white rounded-md dark:bg-gray-800 shadow-lg p-2 z-50 border border-gray-200 dark:border-gray-700"
                      onMouseEnter={() => { if (link.subLinks) setHoveredItemIndex(idx); }} // Keep open when mouse enters pop-out
                      onMouseLeave={() => { if (link.subLinks) setHoveredItemIndex(null); }} // Close when mouse leaves pop-out
                    >
                      <ul className="space-y-1">
                        {link.subLinks.map((subLink, subIdx) => (
                          <li key={subIdx}>
                            <Link
                              to={subLink.path}
                              className="block py-1 px-3 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap"
                            >
                              {subLink.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Logout button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={logout}
          className="flex items-center w-full p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 text-red-600 dark:text-red-400">
          <LogOutIcon size={20} />
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </button>

        <div className="flex items-center mt-4 justify-between">
          {!isCollapsed && (
            <span className="text-sm text-gray-700 dark:text-gray-300">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
          )}
          <button
            onClick={toggleTheme}
            className="ml-auto flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"
          >
            {isDarkMode ? <SunIcon size={16} /> : <MoonIcon size={16} />}
          </button>
        </div>
      </div>
    </nav>
  );
}

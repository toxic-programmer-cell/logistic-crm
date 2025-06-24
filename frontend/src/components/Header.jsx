import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOutIcon, UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
    const { currentUser } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { logout } = useAuth();

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

     // A fallback for when the user data is not yet available.
    if (!currentUser) {
        return (
            <header className="flex items-center justify-end h-16 px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                {/* You can add a loading skeleton here for better UX */}
            </header>
        );
    }
    // console.log(currentUser)
    

    const getInitials = (name) => {
        if (!name) return '?';
        const names = name.split(' ');
        return names.length > 1
            ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
            : name.substring(0, 2).toUpperCase();
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsDropdownOpen(false);
        }
    };

    const roleClasses = currentUser.role === 'ADMIN'
        ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400 bg-yellow-500/10' // Gold theme
        : 'border-gray-400 text-gray-500 dark:text-gray-400 bg-gray-500/10';    // Silver theme


    return (
        <header className="flex items-center justify-end h-16 px-6 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={toggleDropdown}
                        className="flex items-center focus:outline-none"
                        aria-haspopup="true"
                        aria-expanded={isDropdownOpen}
                    >
                        <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-lg">
                            {getInitials(currentUser.name || currentUser.username)}
                        </div>
                        <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-900" title="Online"></span>
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-600">
                            <Link
                                to="/profile" // Or use Link from react-router-dom if you have a profile page
                                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                                onClick={() => setIsDropdownOpen(false)}
                            >
                                <UserIcon size={16} className="mr-2" /> Profile
                            </Link>
                            <button
                                onClick={logout}
                                className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-800"
                            >
                                <LogOutIcon size={16} className="mr-2" /> Logout
                            </button>
                        </div>
                    )}
                </div>
                <div className="hidden sm:block">
                    <div className="flex items-center space-x-2">
                        <p className="font-semibold text-base text-gray-800 dark:text-white">
                            {currentUser.username || 'User Name'}
                        </p>
                        <p className={`inline-block px-2 py-0.5 rounded-full border text-xs font-semibold capitalize ${roleClasses}`}>
                            {currentUser.role || 'Admin'}
                        </p>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {currentUser.email}
                    </p>
                </div>
            </div>
        </header>
    );
}

export default Header;

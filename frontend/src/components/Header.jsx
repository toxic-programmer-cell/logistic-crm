import React from 'react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const { currentUser } = useAuth();

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

    const roleClasses = currentUser.role === 'ADMIN'
        ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400 bg-yellow-500/10' // Gold theme
        : 'border-gray-400 text-gray-500 dark:text-gray-400 bg-gray-500/10';    // Silver theme

    return (
        <header className="flex items-center justify-end h-16 px-6 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
                <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-lg">
                        {getInitials(currentUser.name)}
                    </div>
                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-900" title="Online"></span>
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

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Calendar, Phone } from 'lucide-react';

const ProfilePage = () => {
    const { currentUser } = useAuth();
    console.log(currentUser);
    
    if (!currentUser) {
        // You can replace this with a more sophisticated skeleton loader
        return <div className="p-6">Loading profile...</div>;
    }

    const getInitials = (name) => {
        if (!name) return '?';
        const names = name.split(' ');
        return names.length > 1
            ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
            : name.substring(0, 2).toUpperCase();
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString; // Return original if invalid
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
            const year = String(date.getFullYear()).slice(-2);
            return `${day}/${month}/${year}`;
        } catch (error) {
            return dateString;
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Profile</h1>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-8 border-2 border-gray-900 dark:border-gray-100 shadow-[4px_4px_0_#111827] dark:shadow-[4px_4px_0_#f9fafb] transition-all hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]">
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
                    <div className="w-24 h-24 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-4xl flex-shrink-0">
                        {getInitials(currentUser.name || currentUser.username)}
                    </div>
                    <div className="text-center sm:text-left">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{currentUser.fullName}</h2>
                        <p className="text-gray-500 dark:text-gray-400 capitalize">{currentUser.role}</p>
                    </div>
                </div>

                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                    {currentUser.fullName && <div className="flex items-center"><User size={18} className="mr-3 text-gray-400" /><strong>Name:</strong><span className="ml-2 text-gray-900 dark:text-white">{currentUser.fullName}</span></div>}
                    <div className="flex items-center"><User size={18} className="mr-3 text-gray-400" /><strong>Username:</strong><span className="ml-2 text-gray-900 dark:text-white">{currentUser.username}</span></div>
                    {currentUser.phoneNumber && <div className="flex items-center"><Phone size={18} className="mr-3 text-gray-400" /><strong>Phone Number:</strong><span className="ml-2 text-gray-900 dark:text-white">{currentUser.phoneNumber}</span></div>}
                    <div className="flex items-center"><Mail size={18} className="mr-3 text-gray-400" /><strong>Email:</strong><span className="ml-2 text-gray-900 dark:text-white">{currentUser.email}</span></div>
                    <div className="flex items-center"><Shield size={18} className="mr-3 text-gray-400" /><strong>Role:</strong><span className="ml-2 text-gray-900 dark:text-white capitalize">{currentUser.role.toLowerCase()}</span></div>
                    <div className="flex items-center"><Calendar size={18} className="mr-3 text-gray-400" /><strong>Created At:</strong><span className="ml-2 text-gray-900 dark:text-white">{formatDate(currentUser.createdAt)}</span></div>
                </div>

                <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Edit Profile
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;


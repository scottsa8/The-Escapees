import React, { useState, useRef } from 'react';
import { UserIcon, LogoutIcon } from './heroIcons';
import { useRouter } from 'next/navigation';

const UserButton = ({ username }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const router = useRouter();

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  const handleLogout = () => {
    togglePopup();
    router.push('/');
  };

  return (
    <div className="relative inline-block">
      <div className="user-button transition transform hover:-translate-y-0.5" onClick={togglePopup}>
        <span className="mr-2">{username}</span>
        <UserIcon className="w-6 h-6" />
      </div>
      {isPopupOpen && (
        <div className="absolute z-50 right-0 mt-2 w-48 bg-white rounded-md shadow-lg">
          <button className="block px-4 py-2 text-sm text-gray-700 hover:no-underline rounded-md transition shadow-lg hover:bg-gray-100 w-full text-left" onClick={handleLogout}>
            <LogoutIcon className="w-4 h-4 inline-block mr-2" />Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserButton;

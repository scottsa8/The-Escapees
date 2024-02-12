import React from 'react';

const ToggleSwitch = ({ isEnabled, toggleFunction }) => {
  return (
    <div className="flex items-center justify-center p-4">
      <label htmlFor="toggle" className="flex items-center cursor-pointer">
        {/* Toggle */}
        <div className="relative">
          {/* Input */}
          <input type="checkbox" id="toggle" className="sr-only" checked={isEnabled} onChange={toggleFunction} />
          {/* Line */}
          <div className="w-10 h-4 bg-gray-400 rounded-full shadow-inner"></div>
          {/* Dot */}
          <div className={`dot absolute w-6 h-6 bg-white rounded-full shadow -left-1 -top-1 transition ${isEnabled ? 'transform translate-x-full' : ''}`}></div>
        </div>
        {/* Label */}
      </label>
    </div>
  );
};

export default ToggleSwitch;
import React, { useState, useEffect } from 'react';
import ToggleSwitch from './toggleSwitch';

// HeroIcons
function MoonIcon(){
    return(
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>
)}
function SunIcon(){
    return(
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
)}


export default function Settings() {
    const [x, setX] = useState(50);
    const [y, setY] = useState(50);
    const [theme, setTheme] = useState('light');
    const [isEnabled, setIsEnabled] = useState(false);
    
    const toggleSwitch = () => {
        setIsEnabled(!isEnabled);
    };

    const toggleTheme = () => {
        if (theme === 'light') {
          setTheme('dark');
          document.documentElement.classList.add('dark');
        } else {
          setTheme('light');
          document.documentElement.classList.remove('dark');
        }
      };
    
      useEffect(() => {
        document.documentElement.classList.add(theme);
      }, [theme]);

    return (
        <div className="card-container p-4 dark:bg-gray-500 dark:text-neutral-50">
            <h1 className="text-2xl font-bold mb-4">Settings</h1>
            {/* x slider */}
            <div className="card p-4">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-neutral-50">Occupancy Alarm</label>
                    <ToggleSwitch isEnabled={isEnabled} toggleFunction={toggleSwitch} />
                    <input
                        type="range"
                        id="a-slider"
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        min="0"
                        max="100"
                        value={x}
                        onChange={(e) => setX(e.target.value)}
                    />
                    <div className="text-right text-sm">{x}%</div>
                </div>
                {/* y slider */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-neutral-50">Enviroment Alarm</label>
                    <ToggleSwitch isEnabled={isEnabled} toggleFunction={toggleSwitch} />
                    <input
                        type="range"
                        id="b-slider"
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        min="0"
                        max="100"
                        value={y}
                        onChange={(e) => setY(e.target.value)}
                    />
                    <div className="text-right text-sm">{y}%</div>
                </div>
            </div>
            {/*Theme Toggle*/}
            <button onClick={toggleTheme} className="rounded-full w-10 p-2">
                {theme === 'light' ? (<MoonIcon/>) : (<SunIcon className/>)}
            </button>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import ToggleSwitch from './toggleSwitch';
import {SunIcon, MoonIcon} from './heroIcons'


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
                        className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
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
                        className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
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

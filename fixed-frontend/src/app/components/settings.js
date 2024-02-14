import React, { useState, useEffect } from 'react';
import ToggleSwitch from './toggleSwitch';
import {SunIcon, MoonIcon} from './heroIcons'
import {setCookie, getCookie} from './cookies'

export default function Settings() {
    const [x, setX] = useState(50);
    const [y, setY] = useState(50);
    const [updateDelay, setUpdateDelay] = useState(10);
    const [theme, setTheme] = useState('light');
    const [isEnabled, setIsEnabled] = useState(false);
    
    const toggleSwitch = () => {
        setIsEnabled(!isEnabled);
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        setCookie('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    const handleUpdateDelayChange = (e) => {
        const newValue = e.target.value;
        setUpdateDelay(newValue);
        setCookie('updateDelay', newValue);
    };

    useEffect(() => {
        const savedTheme = getCookie('theme') || 'light';
        const savedUpdateDelay = parseInt(getCookie('updateDelay'), 10) || 10;
        setTheme(savedTheme);
        setUpdateDelay(savedUpdateDelay);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }, []);

    return (
        <div className="card-container p-4 dark:text-blue-100">
            <h1 className="text-2xl font-bold mb-4">Settings</h1>
            {/* x slider */}
            <div className="card shadow-md p-4">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-blue-100">Occupancy Alarm</label>
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
                    <div className="text-right text-sm">{x}</div>
                </div>
                {/* y slider */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-blue-100">Enviroment Alarm</label>
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
                    <div className="text-right text-sm">{y}</div>
                </div>
                {/* Update Delay slider */}
                <label className="block text-sm font-medium text-gray-700 dark:text-blue-100">Update Delay</label>
                <input
                    type="range"
                    id="update-delay-slider"
                    className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                    min="1"
                    max="10"
                    value={updateDelay}
                    onChange={handleUpdateDelayChange}
                />
                    <div className="text-right text-sm">{updateDelay}s</div>
                </div>
            {/*Theme Toggle*/}
            <button onClick={toggleTheme} className="rounded-full w-10 p-2">
                {theme === 'light' ? (<MoonIcon/>) : (<SunIcon className/>)}
            </button>
        </div>
    );
}

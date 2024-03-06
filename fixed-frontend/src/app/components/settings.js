import React, { useState, useEffect, use } from 'react';
import ToggleSwitch from './toggleSwitch';
import {SunIcon, MoonIcon} from './heroIcons'
import {setCookie, getCookie} from './cookies'

export default function Settings() {
    const [temp, setTemp] = useState(30);
    const [noise, setNoise] = useState(30);
    const [light, setLight] = useState(30);
    const [updateDelay, setUpdateDelay] = useState(10);
    const [theme, setTheme] = useState('light');
    const [isEnabled, setIsEnabled] = useState(false);

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
    
    useEffect(() => {
        setCookie('tempNotification', temp);
        setCookie('noiseNotification', noise);
        setCookie('lightNotification', light);
    }, [temp, noise, light]);

    return (
        <div className="card-container p-4 dark:text-blue-100">
            <h1 className="text-2xl font-bold mb-4">Settings</h1>
            <div className="card shadow-md m-4 p-4">
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
                {/*Theme Toggle*/}
                <button onClick={toggleTheme} className="rounded-full w-10 p-2">
                    {theme === 'light' ? (<MoonIcon/>) : (<SunIcon/>)}
                </button>
            </div>
            <div className="card shadow-md m-4 p-4">
                {/* Existing components... */}
                
                {/* Temperature slider */}
                <label className="block text-sm font-medium text-gray-700 dark:text-blue-100">Temperature</label>
                <input
                    type="range"
                    id="temp-slider"
                    className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                    min="0"
                    max="100"
                    value={temp}
                    onChange={(e) => setTemp(e.target.value)}
                />
                <div className="text-right text-sm">{temp}</div>

                {/* Noise slider */}
                <label className="block text-sm font-medium text-gray-700 dark:text-blue-100">Noise</label>
                <input
                    type="range"
                    id="noise-slider"
                    className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                    min="0"
                    max="100"
                    value={noise}
                    onChange={(e) => setNoise(e.target.value)}
                />
                <div className="text-right text-sm">{noise}</div>

                {/* Light slider */}
                <label className="block text-sm font-medium text-gray-700 dark:text-blue-100">Light</label>
                <input
                    type="range"
                    id="light-slider"
                    className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                    min="0"
                    max="100"
                    value={light}
                    onChange={(e) => setLight(e.target.value)}
                />
                <div className="text-right text-sm">{light}</div>
            </div>
        </div>
    );
}

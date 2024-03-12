import React, { useState, useEffect, use } from 'react';
import {SunIcon, MoonIcon} from './heroIcons'
import {setCookie, getCookie} from './cookies'
import {PlusIcon,CloseIcon,SettingsIcon} from './heroIcons'
import { fetchApi } from './apiFetcher';
import { useQuery } from 'react-query';
import {motion} from 'framer-motion';

//Hook to set if the light theme is active or not
export default function Settings({dashThemeHook,dashDomainChange}) {
    const [temp, setTemp] = useState(30);
    const [noise, setNoise] = useState(30);
    const [light, setLight] = useState(30);
    const [updateDelay, setUpdateDelay] = useState(10);
    const [theme, setTheme] = useState('light');
    const [showAddDomain, setShowAddDomain] = useState(false);
    const [domainName, setDomainName] = useState('');
    const [domainSettings, setDomainSettings] = useState(false);
    const [formValues, setFormValues] = useState({ name: '', microbit: '', maxTemp: '', maxNoise: '', maxLight: '' });
    const { data: domains, refetch: refetchDomains } = useQuery('domains', () => fetchApi("getDomains"), { initialData: ['Hotel', 'Prison'] });
    const { data: selectedDomain, refetch: refetchSelectedDomain } = useQuery('selectedDomain', () => fetchApi("getDomain"), { initialData:'Prison' });



    const selectDomain = async (domain) => {
        dashDomainChange(domain)
        await fetchApi("setDomain?domain="+domain);
        refetchSelectedDomain();
    };
    const addDomain = async (domainName) => {
        await fetchApi("setDomain?domain="+domainName)
        refetchDomains();
        setShowAddDomain(false);
    };
    const handleChange = (event) => {
        setFormValues({ ...formValues, [event.target.name]: event.target.value });
    };


    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        dashThemeHook(newTheme === 'light')
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

    const updateDomainSettings = (event) => {
        event.preventDefault();
        const { name, microbit, maxTemp, maxNoise, maxLight } = formValues;
        fetchApi(`addNode?roomName=${name}&mb=${microbit}&maxes=${maxTemp},${maxNoise},${maxLight}`)
            .then(response => {
                if (response.ok) {
                    alert('Data updated successfully');
                } else {
                    alert('Error updating data');
                }
            })
            .catch(error => console.error('Error:', error));
        setDomainSettings(false);
    };

    return (
        <div className="card-container p-4 dark:text-blue-100">
            <h1 className="text-2xl font-bold mb-4">Settings</h1>
            <div className="settings-width card shadow-md m-4 p-4">
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
                
                {/* Notification Settings */}
                <div className="settings-width flex-grow card shadow-md m-4 p-4">
                    <h1 className="text-xl font-bold mb-4">Notification Settings</h1>
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
                <div className="domains-container flex flex-wrap flex-row">
                {domains.map((domain, index) => (
                    <motion.div key={index} onClick={() => selectDomain(domain)} className={`domain-dimensions card shadow-md m-4 p-4 ${domain === selectedDomain ? 'selected-color' : ''}`}
                        layoutId={domain.toLowerCase()} 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition ={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                        <h1 className="font-bold text-sky-500">{domain.charAt(0).toUpperCase() + domain.slice(1)}</h1><br/>
                        <div onClick={() => setDomainSettings(true)}>
                            <SettingsIcon />
                        </div>
                    </motion.div>
                ))}
                <div className="domain-dimensions card shadow-md m-4 p-4" onClick={() => setShowAddDomain(true)}>
                    <h1 className="font-bold text-sky-500">Add Domain</h1>
                    <PlusIcon/>
                </div>
                {showAddDomain && (
                    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white dark:bg-sky-900 p-4 rounded shadow flex flex-col justify-between items-start">
                        <div className="w-full flex justify-between items-center">
                            <h2 className="text-lg font-bold mb-2">Domain Setup</h2>
                            <button className="rounded-full" onClick={() => setShowAddDomain(false)}><CloseIcon/></button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); setShowAddDomain(false); addDomain(domainName); }}>
                            <label className="block mb-2">
                            Domain Name
                            <input onChange={e => setDomainName(e.target.value)} type="text" className="mt-1 block dark:bg-sky-800 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                            </label>
                            <button type="submit" className="mt-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Submit
                            </button>
                        </form>
                        </div>
                    </div>
                    )}
                {domainSettings && (
                <motion.div className="form-overlay"
                    initial={{ opacity: 0}}
                    animate={{ opacity: 1}}
                >
                    <motion.form onSubmit={updateDomainSettings}

                    layoutId={`${selectedDomain.toLowerCase()}`}
                    >
                        <button onClick={() => setDomainSettings(false)}><CloseIcon/></button>
                        <label>Name:
                            <input type="text" name="name" onChange={handleChange} />
                        </label>
                        <label>Microbit:
                            <input type="text" name="microbit" onChange={handleChange} />
                        </label>
                        <label>Max Temp:
                            <input type="text" name="maxTemp" onChange={handleChange} />
                        </label>
                        <label>Max Noise:
                            <input type="text" name="maxNoise" onChange={handleChange} />
                        </label>
                        <label>Max Light:
                            <input type="text" name="maxLight" onChange={handleChange} />
                        </label>
                        <button type="submit">Submit</button>
                    </motion.form>
                </motion.div>
            )}
        </div>
    </div>
  );
}


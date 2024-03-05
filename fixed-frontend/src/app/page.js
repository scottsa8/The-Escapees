"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useId } from 'react';
import Image from "next/image";
import "./main.css"
import { network } from './layout';
import {setCookie} from './components/cookies'
import { fetchApi } from './components/apiFetcher';
// import { ReactComponentElement as SettingsImage } from '../../public/settings-cog.svg';
// import settingsimage from '/public/settings-cog.svg';


export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [showPopup2, setShowPopup2] = useState(false);
  const [ip, setIP] = useState(network.ip);
  const [port, setPort] = useState(network.port);

  const [isSettingsOpen,setSettingsOpen] = useState(false)

  const router = useRouter();

  const usernameId = useId();
  const passwordId = useId();
  const ipId = useId();
  const portId = useId();

  const toggleSettings = () => {
    setSettingsOpen(!isSettingsOpen)
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    try {
      const data = await fetchApi(`checkLog?user=${username}&pass=${password}`);
      if (data === true) {
        setCookie("username",username);
        const userType = await fetchApi(`getUserType?user=${username}`);
        console.log(userType); 
        router.push('/dashboard');
      } else {
        setShowPopup2(true);
        setTimeout(() => {
          setShowPopup2(false);
        }, 10000);
        setShowPopup(true);
        setTimeout(() => {
          setShowPopup(false);
        }, 3000);
      }
    } catch (error) {
      console.error(error);
      throw new Error('Login failed');
    }
  };

  const handleNetworkSave = () => {
    console.log("IP: %s", ip )
    console.log("Port: %s", port)
    network.ip = ip;
    network.port = port;
  }

  // function handleModal(ip,port){
  //   console.log(`ip: ${ip}, port: ${port}`)
  // }

  return (
    <>
      <title>Login - Prison System</title>
    
      <div className="flex items-center justify-center h-screen">
        <div className="p-10 flex flex-col w-5/6 sm:mx-auto sm:max-w-md bg-gradient-to-r from-indigo-800 to-purple-950 text-sky-200 rounded-lg">

            <h2 className="pb-10 self-center">
                Sign in to your account
            </h2>
            {showPopup && (
              <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded relative" role="alert">
                <strong className="font-bold">Invalid login!</strong>
                <span className="block sm:inline">The username or password you entered is incorrect.</span>
              </div>
            )}
            {showPopup2 && (
              <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded relative" role="alert">
                <strong className="font-bold">No connection to server found!</strong>
                <span className="block sm:inline">Server running?</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col grow justify-center">

                <div id="input-fields" className="justify-center flex flex-col grow">    
                    <label htmlFor={usernameId} className="self-start pl-4"> Username </label>
                    <input name="username" className="ml-4 mr-4 mb-4 p-4 bg-black opacity-30 rounded-md" type="text" id={usernameId} 
                        value={username} onChange={e => setUsername(e.target.value)} placeholder="Username"/>

                    <label htmlFor={passwordId} className="self-start pl-4"> Password  </label>
                        <input name="password" className="ml-4 mr-4 p-4 mb-4 bg-black opacity-30 rounded-md" type="password" id={passwordId}
                        value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"/>
                    
                </div>
                
                <section className="flex flex-row-reverse justify-between">
                    <button type="submit" className="bg-purple-700 m-4 w-full h-12 rounded-lg">Log In</button>
                </section>
            </form> 
            <button aria-label='Network settings' className='flex justify-center text-center bg-purple-700 m-4 p-1  rounded-lg' onClick={toggleSettings}>

              <Image src="/settings-cog.svg" className='filter invert' width={36} height={36} 
              alt='Cog with 6 spokes'/>
              <label>Network Settings</label>
            </button>
            {isSettingsOpen && (
              <div className='flex flex-col min-h-48 sm:mx-auto' onSubmit={handleNetworkSave}>
                <div id="input-fields" className="justify-between flex flex-col grow">    

                  <label htmlFor={ipId}> IP Address: </label>
                        <input name="IP address" type="text"  
                        className="ml-4 mr-4 mb-4 p-4 bg-black opacity-30 rounded-md"
                        value={ip} onChange={e => setIP(e.target.value)} />

                  <label htmlFor={portId} className=""> Port:</label>
                  <input name="Port" type="text" 
                        maxLength={4}
                        className="ml-4 mr-4 mb-4 p-4 bg-black opacity-30 rounded-md"
                        value={port} onChange={e => setPort(e.target.value)} />
                </div>
                <section className="flex flex-row-reverse justify-between">
                  <button onClick={handleNetworkSave}  className="bg-purple-700 m-4 w-full h-12 rounded-lg">Save</button>
                </section>
              </div>
            )}
        </div>
      </div>
    </>
  );
}
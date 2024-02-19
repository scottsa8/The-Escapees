"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useId } from 'react';
import Image from "next/image";
import "./main.css"
import { network } from './layout';
import {setCookie} from './components/cookies'


export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [showPopup2, setShowPopup2] = useState(false);
  const router = useRouter();

  const usernameId = useId();
  const passwordId = useId();

  // const login = async (username, password) => {
  //   console.log("Validating")
  //   const response = await fetch(`http://${network.ip}:${network.port}/checkLog?user=${username}&pass=${password}`);
  //   const data = await response.json();
    
  //   if (data == 'true') {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // };

  const login = async (username, password) => {
    try {
      const response = await fetch(`http://${network.ip}:${network.port}/checkLog?user=${username}&pass=${password}`)
      const data = await response.json();
      if (data == true) {
        return true;
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      setShowPopup2(true);
      const intervalId1 = setInterval(() => {
        setShowPopup2(false);
      }, 10000);
      setTimeout(() => {
        clearInterval(intervalId1);
      }, 10000);
  
      if (username === 'admin' && password === 'password') {
        return true;
      } else {
        setShowPopup(true);
        const intervalId2 = setInterval(() => {
          setShowPopup(false);
        }, 3000);
        setTimeout(() => {
          clearInterval(intervalId2);
        }, 3000);
       
        return false;
       
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const isLoggedIn = await login(username, password);
    if (isLoggedIn) {
      setCookie("username",username);
      //const response2 = await fetch(`http://${network.ip}:${network.port}/getUserType?user=${username}`);
      //const userType = await response2.text(); //DO SOMETHING WITH IT?
      //console.log(userType); 
      router.push('/dashboard');
    }
  };

  // function handleModal(ip,port){
  //   console.log(`ip: ${ip}, port: ${port}`)
  // }

  return (
    // <div className="login">
    //   <form onSubmit={handleSubmit}>
    //     <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
    //     <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
    //     <button type="submit">Login</button>
    //   </form>
    // </div>

    
    <div className="flex items-center justify-center h-screen">
      <div className="p-10 flex flex-col w-5/6 sm:mx-auto sm:max-w-md bg-gradient-to-r from-indigo-800 to-purple-950 text-sky-300 rounded-lg p-2">

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
      </div>
    </div>
  );
}
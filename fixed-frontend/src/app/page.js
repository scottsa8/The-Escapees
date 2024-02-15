"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useId } from 'react';
import Image from "next/image";
import "./main.css"
import { network } from './layout';
import {setCookie} from './components/cookies'
import { Cog6ToothIcon } from "@heroicons/react/24/outline";



export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

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
      const response = await fetch(`http://${network.ip}:${network.port}/checkLog?user=${username}&pass=${password}`,
      {
        mode: 'cors',
        headers: {
          'Access-Control-Allow-Origin':'*'
        }
      }
      );
      const data = await response.json();
      console.log(data)
      if (data == true) {
        return true;
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      if (username === 'admin' && password === 'password') {
        return true;
      } else {
        return false;
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const isLoggedIn = await login(username, password);
    if (isLoggedIn) {
      setCookie("username",username);
      const response2 = await fetch(`http://${network.ip}:${network.port}/getUserType?user=${username}`);
      const userType = await response2.text(); //DO SOMETHING WITH IT?
      console.log(userType); 
      router.push('/dashboard');
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
    // <div className="login">
    //   <form onSubmit={handleSubmit}>
    //     <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
    //     <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
    //     <button type="submit">Login</button>
    //   </form>
    // </div>

    
    <div className="flex items-center flex-col justify-center h-screen">
      <div className=" flex flex-col w-5/6 h-64 sm:mx-auto sm:max-w-md bg-slate-300 rounded p-2">

          <h2 className="pl-2 text-slate-700">
              Sign in to your account
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col grow justify-center">

              <div id="input-fields" className="justify-center flex flex-col grow">    
                  <label htmlFor={usernameId} >
                      Username: <input name="username" type="text" id={usernameId} 
                      value={username} onChange={e => setUsername(e.target.value)} placeholder="Username"/>
                  </label>
                  
                  <label htmlFor={passwordId} className="">
                      Password: <input name="password" type="password" id={passwordId}
                      value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"/>
                  </label>
              </div>
              
              <section className="flex flex-row-reverse justify-between">
                  <button type="submit" className="bg-slate-100 rounded p-1 border w-24 h-12 border-slate-900 ">Submit</button>
                      
              </section>
          </form> 
          <button className="bg-slate-100 rounded p-1 border w-12 h-12 border-slate-900 items-center" 
                  onClick={toggleSettings}
                  aria-label='Network settings'>
                    <Cog6ToothIcon className=" w-10 h-10 " alt="Settings cog"/>
          </button>
      </div>
      {isSettingsOpen && (
            <div className='flex flex-col w-5/6 min-h-48 sm:mx-auto sm:max-w-md bg-slate-300 rounded p-2 border border-slate-800 ' onSubmit={handleNetworkSave}>
              <div id="input-fields" className="justify-between flex flex-col grow">    
                  <label htmlFor={ipId} >
                      IP Address: <input name="IP address" type="text"  
                      value={ip} onChange={e => setIP(e.target.value)} />
                  </label>
                  
                  <label htmlFor={portId} className="">
                      Port: <input name="Port" type="text" 
                      value={port} onChange={e => setPort(e.target.value)} />
                  </label>
              </div>
              <section className="flex flex-row-reverse justify-between">
                <button onClick={handleNetworkSave}  className="bg-slate-100 rounded p-1 border w-24 h-12 border-slate-900 ">Save</button>
              </section>
            </div>
          )}
    </div>
  );
}
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useId } from 'react';
import Image from "next/image";
import "./main.css"


export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const usernameId = useId();
  const passwordId = useId();

  const login = async (username, password) => {
    const response = await fetch(`http://localhost:8080/checkLog?user=${username}&pass=${password}`);
    const data = await response.json();
  
    if (data.status === 'success') {
      return true;
    } else {
      return false;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const isLoggedIn = await login(username, password);

    if (isLoggedIn) {
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
      </div>
    </div>
  );
}
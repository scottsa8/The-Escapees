import "../main.css";
import { useId } from "react";
import Image from "next/image";
import { metadata } from "../layout";



export default function login(){
    const usernameId = useId();
    const passwordId = useId();

    metadata.title="Login"

    function submit(formData){
        const uName = formData.get("username");
        const pWord = formData.get("password");
        alert(`Username: '{uName}', Password: {pWord}`)
    }

    return(

        <div className="flex items-center justify-center h-screen">
            <div className=" flex flex-col w-5/6 h-64 sm:mx-auto sm:max-w-md bg-slate-300 rounded p-2">
            
                <h2 className="pl-2 text-slate-700">
                    Sign in to your account
                </h2>

                <form className="flex flex-col grow justify-center">

                    <div id="input-fields" className="self-center">    
                        <label htmlFor={usernameId} >
                            Username: <input name="username" type="text" id={usernameId} />
                        </label>
                        
                        <label htmlFor={passwordId} className="">
                            Password: <input name="password" type="password" id={passwordId}/>
                        </label>
                    </div>
                    
                        
                </form>

                <section className="flex flex-row-reverse justify-between">
                        <button type="submit" className="bg-slate-100 rounded p-1 border w-20 border-slate-900 ">Submit</button>
                        <Image src="/settings-cog.svg" alt="Settings cog" width={24} height={24} />
                </section>
            </div>
      </div>
    )

} 
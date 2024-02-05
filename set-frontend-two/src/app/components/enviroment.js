import React, {useEffect, useState} from "react";
import { Listbox } from "@headlessui/react";
import { network } from "../layout";

function EnviromentBox({measurement,value}){
    // const [value,setValue] = useState(0)

    return(
        <div className="flex flex-col w-12 min-h-49 border rounded border-neutral-900 grow ">
            <label className="bg-neutral-600 text-center text-xl text-neutral-200">{measurement}</label>
            <label className="text-center text-9xl">{value}</label>
        </div>
        

    )
}

export default function EnviromentContainer(){
    const locations = [
        { name:"Room1"},
        { name:"Room2"},
        { name:"Room3"},
    ]
    const [selectedLocation, setLocation] = useState(locations[0])

    

    const values = {
        temp: "0",
        light: "0",
        noise: "0"
    }

    // const getLocations = async () => {
    //     const response = await fetch(`http://${network.ip}:${network.port}/getPeople?loc=${selectedLocation.name}`)
    //     const data = await response.json();
    //     for(value in data){
    //         locations.push({"name":value})
    //     }
    // };

    // const getEnvData = async () => {
    //     const response = await fetch(`http://${network.ip}:${network.port}/getEnv?loc=${selectedLocation.name}`);
    //     const data = await response.json();
        
    //     values.temp = data["Temperature"];
    //     values.noise = data["Noise Level"];
    //     values.light = data["Light Level"];
    // };

    // function handleLocationChange(value){
    //     setLocation(value)
    //     getEnvData()
    // }
    

    // const splitString =  "Data ID: 1, Timestamp: 2023-01-31 16:00:00.0, Temperature: 25.00, Noise Level: 0.00, Light Level: 10.00!Data ID: 2, Timestamp: 2023-01-31 16:30:00.0, Temperature: 22.00, Noise Level: 1.00, Light Level: 5.00!".split("!");
    // // console.log(JSON.parse(splitString[splitString.length - 1])) // Last element is most recent
    // console.log(splitString[splitString.length - 1])
    
    // const list = async() => {
    //     const response = await fetch("http://localhost:5500/getEnv");
    //     const data = await response.json()
    //     return data
    // };
    // console.log(list)
    
    
    

    // useEffect(() => {
    //     getLocations()
    //     getEnvData()
    //     const interval=setInterval(()=>{
    //         getEnvData()
    //         },10000)
       
       
    //       return()=>clearInterval(interval)
    // })

    return(
        <div className="w-full flex flex-col items-center rounded border m-0.5 border-neutral-900 bg-neutral-200">
            <div className="w-full flex justify-center border border-neutral-950 bg-neutral-300 ">
                <Listbox value={selectedLocation} onChange={setLocation} >
                <div className=" flex flex-col justify-center w-24 border border-neutral-900">
                <Listbox.Label className="block text-lg text-center font-xl leading-6 text-neutral-900">Location:</Listbox.Label>
                    <Listbox.Button className="rounded hover:underline  text-xl w-24 h-11 grow text-center text-white bg-neutral-600">{selectedLocation.name}</Listbox.Button>
                    <Listbox.Options className="flex flex-col self-center" >
                       {locations.map( (location) => (
                            <Listbox.Option
                                key={location.name}
                                value={location}
                                className="hover:underline text-xl rounded text-center hover:bg-neutral-400 hover:cursor-pointer h-11 w-24"
                            >{location.name}
                            </Listbox.Option>
                        ))} 
                    </Listbox.Options>
                    </div>
                </Listbox>
                
            </div>
            <div className="w-full flex justify-between">
                <EnviromentBox measurement="Temp" value={values["temp"]}/>
                <EnviromentBox measurement="Light" value={values["light"]}/>
                <EnviromentBox measurement="Noise" value={values["noise"]}/>
            </div>
        </div>
    )
}


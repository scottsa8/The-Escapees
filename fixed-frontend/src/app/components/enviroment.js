import React, {useEffect, useState} from "react";
import { Listbox } from "@headlessui/react";
import { network } from "../layout";
import Dial from "./dial";
import { sendNotification } from "./notifications";
import { getCookie } from "./cookies"
import { get } from "http";
import LocationCountBox from "./locationNumber";
import EnvironmentBox from "./EnvironmentBox";


export default function EnviromentContainer(){
    const [locations, setLocations] = useState([{name:""}]);
    const [selectedLocation, setSelectedLocation] = useState(locations[0])
    const [values, setValues] = useState({
        temp: "0",
        light: "0",
        noise: "0"
      });
    let timeout=0;
    const debug=false;
    const handleRoomClick = (roomName) => {
        if(debug){console.log(`Room clicked: ${roomName}`);}
        const room = locations.find(location => location.room === roomName);
        setSelectedLocation(room ? room : null);
    };

    const getLocations = async () => {
        let allRooms =[];
        try{
            const response = await fetch(`http://${network.ip}:${network.port}/getRooms`,
            {mode: 'cors',headers: {'Access-Control-Allow-Origin':'*'}})
            const data = await response.json();
            let data2 = data['rooms'];
            let data3 = data2['data'];
            
            for (let i = 0; i < data3.length; i++) {
                let realdata=data3[i]
                if(realdata['room']==="gate1" || realdata['room']==="gate2"){
                }else{
                    allRooms.push(data3[i])
                }
               
            }
            return allRooms;
        }catch(error){
            if(debug){console.error("no rooms, server running?")}
            let newValues = {
                temp: "0",
                noise: "0",
                light: "0"
            };
            setValues(newValues);
            return allRooms;
        }
       
    };


     const getEnvData = async () => {
        let d= new Date();
        let timeoutTime= d.toTimeString().split(" ")[0]
        try{    
            //console.log("selectedLocation.room:"+selectedLocation.room)
            const response = await fetch(`http://${network.ip}:${network.port}/getEnv?loc=${selectedLocation.room}`,
            {mode: 'cors',headers: {'Access-Control-Allow-Origin':'*'}})        
            const data = await response.json();
            console.log(data)
            let data2 = data['environment'];
            let data3 = data2['data'];
            let realData = data3['0']; //index of the data you want from array 0 = most recent
            let inTime = realData['Timestamp'].split(" ")[1].split(".")[0]
            if(inTime!=timeoutTime){
                timeout=timeout+1;
                if(timeout>=3){
                    if(debug){console.log("lost con")}
                    throw new Error("lost connection")
                }
            }else{
                if(!realData['error']==""){
                    console.error("room, "+selectedLocation.name+" not found");
                    throw new Error("no room in DB")
                }else{
                    timeout=0;
                    let newValues = {
                        temp: realData['Temperature'],
                        noise: realData['NoiseLevel'],
                        light: realData['LightLevel']
                    };
                    setValues(newValues);         
                }
            }
        }catch(err){
            let newValues = {
                temp: "0",
                noise: "0",
                light: "0"
            };
            setValues(newValues);
            return;
        }
     };
        

    function handleLocationChange(value){
        setSelectedLocation(value);
    }
    
    useEffect(() => {
        getLocations().then(newLocations => {
            setLocations(newLocations);
            if (selectedLocation.name == "") {
                setSelectedLocation(newLocations[0]);
            }
        });
    }, []);

    useEffect(() => {
        const fetchUpdateDelay = () => {
            const delay = getCookie('updateDelay');
            return delay ? parseInt(delay, 10) * 1000 : 10000;
        };

        const fetchLocations = () => {
            getLocations().then(newLocations => {
                setLocations(newLocations);
                getEnvData();
            });
        };
        if(debug){console.log("Updating....");}
        fetchLocations();

        const interval = setInterval(() => {
            fetchLocations();
        }, fetchUpdateDelay());
        return () => clearInterval(interval);
    }, [selectedLocation]);

    const getSelectedRoom = () =>{
        let room = "";
        try{
            room = selectedLocation.room;
        }catch(e){
            room = "";
        }

        return room;
    }

    return (
        <div>
            <div className="flex flex-col items-center p-2 bg-transparent">
                {/* <div className="w-full flex justify-center p-3 bg-transparent">
                    <Listbox value={selectedLocation} onChange={handleLocationChange}>
                        <div className="flex flex-col justify-center w-24">
                            <Listbox.Label className="block text-lg text-center font-xl leading-6 text-neutral-900 dark:text-blue-100">Location:</Listbox.Label>
                            <Listbox.Button className="rounded hover:underline text-xl w-24 h-11 grow text-center text-white bg-neutral-600 dark:bg-sky-800 dark:text-blue-100">{getSelectedRoom}</Listbox.Button>
                            <Listbox.Options className="flex flex-col self-center dark:text-blue-100">
                                {locations.map((location, index) => (
                                    <Listbox.Option
                                        key={index}
                                        value={location}
                                        className="text-xl rounded text-center hover:bg-neutral-400 hover:cursor-pointer h-11 w-24 p-2"
                                    >
                                        {location.room}
                                    </Listbox.Option>
                                ))}
                            </Listbox.Options>
                        </div>
                    </Listbox>
                </div> */}
                <div className="w-full flex flex-row flex-wrap justify-center bg-transparent dark:text-blue-100">
                    <EnviromentBox measurement="Temp" value={values["temp"]}/>
                    <EnviromentBox measurement="Light" value={values["light"]}/>
                    <EnviromentBox measurement="Noise" value={values["noise"]}/>
                </div>
            </div>
        <LocationCountBox onRoomClick={handleRoomClick} />
        </div>
            
        
    )
}



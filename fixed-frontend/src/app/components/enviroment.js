import React, {useEffect, useState} from "react";
import { Listbox } from "@headlessui/react";
import { network } from "../layout";
import Dial from "./dial";
import { sendNotification } from "./notifications";
import { getCookie } from "./cookies"
import { get } from "http";
const EnviromentBox = ({ measurement, value }) => {
    return (
        <div className="flex flex-col items-center p-4 bg-transparent">
            <Dial value={value} min={0} max={40} onMaxValue={() => {
                sendNotification('Max Value Reached', { body: `Measurement: ${measurement}, Value: ${value}`});
            }}/>
            <span className="text-lg font-medium mt-2">{measurement}</span>
        </div>
    );
};

export default function EnviromentContainer(){
    const [locations, setLocations] = useState([{name:""}]);
    const [selectedLocation, setSelectedLocation] = useState(locations[0])
    const [values, setValues] = useState({
        temp: "20",
        light: "30",
        noise: "39"
      });

    const getLocations = async () => {
        try{
            const response = await fetch(`http://${network.ip}:${network.port}/getRooms`)
            const data = await response.json();
            let data2 = data['rooms'];
            let data3 = data2['data'];
            let allRooms =[];
            for (let i = 0; i < data3.length; i++) {
                let realdata=data3[i]
                if(realdata['room']==="gate1" || realdata['room']==="gate2"){
                }else{
                    allRooms.push(data3[i])
                }
               
            }
            return allRooms;
        }catch(error){
            console.error("no rooms, server running?")
            return allRooms;
        }
       
    };


     const getEnvData = async () => {
        try{
            console.log("name:"+selectedLocation.room)
            const response = await fetch(`http://${network.ip}:${network.port}/getEnv?loc=${selectedLocation.room}`)        
            const data = await response.json();
            //console.log("data:"+data['environment'])
            let data2 = data['environment'];
            let data3 = data2['data'];
            let realData = data3['0']; //index of the data you want from array 0 = most recent
            if(!realData['error']==""){
                console.error("room, "+selectedLocation.name+" not found");
                return;
            }else{
                let newValues = {
                    temp: realData['Temperature'],
                    noise: realData['NoiseLevel'],
                    light: realData['LightLevel']
                  };
                setValues(newValues);
                
            }
        }catch(err){
            console.error(err) //UNCOMMENT ME OUT TO SEE CONSOLE ERROR SPAM !
            return;
        }
     };
        

    function handleLocationChange(value){
        setSelectedLocation(value);
    }
    

    // const splitString =  "Data ID: 1, Timestamp: 2023-01-31 16:00:00.0, Temperature: 25.00, Noise Level: 0.00, Light Level: 10.00!Data ID: 2, Timestamp: 2023-01-31 16:30:00.0, Temperature: 22.00, Noise Level: 1.00, Light Level: 5.00!".split("!");
    // // console.log(JSON.parse(splitString[splitString.length - 1])) // Last element is most recent
    // console.log(splitString[splitString.length - 1])
    
    // const list = async() => {
    //     const response = await fetch("http://localhost:5500/getEnv");
    //     const data = await response.json()
    //     return data
    // };
    // console.log(list)
    

    useEffect(() => {
        const fetchUpdateDelay = () => {
          const delay = getCookie('updateDelay');
          return delay ? parseInt(delay, 10) * 1000 : 10000;
        };
    
        const fetchLocations = () => {
          getLocations().then(newLocations => {
            setLocations(newLocations);
            if (newLocations.length > 0) {
                setSelectedLocation(newLocations[0]);
              }
            getEnvData();
          });
        };
        fetchLocations();
    
        const interval = setInterval(() => {
          fetchLocations();
        }, fetchUpdateDelay());
        return () => clearInterval(interval);
      }, []);

      useEffect(() => {
        getEnvData();
      }, [selectedLocation]);

    return (
        <div className="w-full flex flex-col items-center rounded p-2 m-0.5 bg-transparent">
            <div className="w-full flex justify-center p-3 bg-transparent">
                <Listbox value={selectedLocation} onChange={handleLocationChange}>
                    <div className="flex flex-col justify-center w-24">
                        <Listbox.Label className="block text-lg text-center font-xl leading-6 text-neutral-900 dark:text-blue-100">Location:</Listbox.Label>
                        <Listbox.Button className="rounded hover:underline text-xl w-24 h-11 grow text-center text-white bg-neutral-600 dark:bg-sky-800 dark:text-blue-100">{selectedLocation.room}</Listbox.Button>
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
            </div>
            <div className="w-full flex justify-between bg-transparent dark:text-blue-100">
                <EnviromentBox measurement="Temp" value={values["temp"]}/>
                <EnviromentBox measurement="Light" value={values["light"]}/>
                <EnviromentBox measurement="Noise" value={values["noise"]}/>
            </div>
        </div>
    )
}



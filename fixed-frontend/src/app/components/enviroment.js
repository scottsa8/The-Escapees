import React, {useEffect, useState} from "react";
import { network } from "../layout";
import { fetchUpdateDelay } from "./cookies"
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
    const dialSize = 170;
    const dialClassName="dial-container";
    const debug=false;

    /**
     * Handles the click event on a room.
     * 
     * @param {string} roomName - The name of the room that was clicked.
     */
    const handleRoomClick = (roomName) => {
        if(debug){console.log(`Room clicked: ${roomName}`);}
        const room = locations.find(location => location.room === roomName);
        setSelectedLocation(room ? room : null);
    };

    /**
     * Retrieves the locations from the server.
     * Wait for promise to reslove before using the data.
     * @returns {Promise<Array>} An arraoy f room objects.
     */
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


    /**
     * Retrieves environment data from a specified location.
     * Env data is stored in the state variable `values`.
    */
    const getEnvData = async () => {
        let d= new Date();
        let timeoutTime= d.toTimeString().split(" ")[0]
        try{    
            //console.log("selectedLocation.room:"+selectedLocation.room)
            const response = await fetch(`http://${network.ip}:${network.port}/getEnv?loc=${selectedLocation.room}&order=DESC`,
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

    const fetchLocations = () => {
        getLocations().then(newLocations => {
            setLocations(newLocations);
            getEnvData();
        });
    };

    useEffect(() => {
        getLocations().then(newLocations => {
            setLocations(newLocations);
            if (selectedLocation.name == "") {
                setSelectedLocation(newLocations[0]);
            }
        });
    }, []);

    useEffect(() => {
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
                <div className="w-full flex flex-row flex-wrap justify-center bg-transparent dark:text-blue-100">
                    <EnvironmentBox dialClassName={dialClassName} size={dialSize} measurement="Temp" value={values["temp"]} max="50"/>
                    <EnvironmentBox dialClassName={dialClassName} size={dialSize} measurement="Light" value={values["light"]} max="100"/>
                    <EnvironmentBox dialClassName={dialClassName} size={dialSize} measurement="Noise" value={values["noise"]} max="50"/>
                </div>
            <LocationCountBox onRoomClick={handleRoomClick} />
            </div>
        </div>
             
    )
}

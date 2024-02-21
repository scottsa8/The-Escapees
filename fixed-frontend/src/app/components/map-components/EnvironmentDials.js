import { useState, useEffect } from "react";
import EnvironmentBox from "../EnvironmentBox";
import { network } from "../../layout";
import { getCookie } from "../cookies";

const EnvironmentDials = ({roomName}) => {
    let timeout;
    const dialSize = 80;
    const dialClassName = "map-dial-container"
    const [values, setValues] = useState({
        temp: "0",
        light: "0",
        noise: "0"
    });
    const [locations, setLocations] = useState([{name:""}]);
    const [selectedLocation, setSelectedLocation] = useState(locations[0])

    useEffect(() => {
        const fetchUpdateDelay = () => {
            const delay = getCookie('updateDelay');
            return delay ? parseInt(delay, 10) * 1000 : 10000;
        };

        const fetchLocations = () => {
            getEnvData();
        };
        const interval = setInterval(() => {
            fetchLocations();
        }, fetchUpdateDelay());
        return () => clearInterval(interval);
    }, []);

    //afte the popup loads?
    // const handleRoomClick = (roomName) => {
    //     if(debug){console.log(`Room clicked: ${roomName}`);}
    //     const room = locations.find(location => location.room === roomName);
    //     setSelectedLocation(room ? room : null);
    // };

    //fetches the locations
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

    //gets the data
    const getEnvData = async () => {
        let d= new Date();
        let timeoutTime= d.toTimeString().split(" ")[0]
        try{    
            const response = await fetch(`http://${network.ip}:${network.port}/getEnv?loc=${roomName}&order=DESC`,
            {mode: 'cors',headers: {'Access-Control-Allow-Origin':'*'}})        
            const data = await response.json();
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
                    console.error("room, "+roomName+" not found");
                    throw new Error("no room in DB")
                }else{
                    timeout=0;
                    let newValues = {
                        temp: realData['Temperature'].split(".")[0],
                        noise: realData['NoiseLevel'].split(".")[0],
                        light: realData['LightLevel'].split(".")[0]
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

    return ( 
        <div className="w-full flex flex-col sm:flex-row justify-center bg-transparent dark:text-blue-100">
            <EnvironmentBox dialClassName={dialClassName} size = {dialSize} measurement="Temp" value={values["temp"]}/>
            <EnvironmentBox dialClassName={dialClassName} size = {dialSize} measurement="Light" value={values["light"]}/>
            <EnvironmentBox dialClassName={dialClassName} size = {dialSize} measurement="Noise" value={values["noise"]}/>
        </div>
    );
}
 
export default EnvironmentDials;
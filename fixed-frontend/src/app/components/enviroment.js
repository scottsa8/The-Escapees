import React, {useEffect, useState} from "react";
import { fetchUpdateDelay } from "./cookies"
import LocationCountBox from "./locationNumber";
import EnvironmentBox from "./EnvironmentBox";
import { useQuery } from 'react-query';
import { fetchApi } from './apiFetcher';
export default function EnviromentContainer(){
    const [selectedLocation, setSelectedLocation] = useState("")
    const [values, setValues] = useState({
        temp: "0",
        light: "0",
        noise: "0"
      });
    let timeout=0;
    const dialSize = 170;
    const dialClassName="dial-container";

    
    const handleRoomClick = (roomName) => {
        const room = locationData.find(location => location.room === roomName);
        setSelectedLocation(room ? room : null);
    };

    const { data: locationData, isError: locationError } = useQuery('locations', async () => {
        const data = await fetchApi('getRooms');
        const rooms = data.rooms.data.filter(room => room.room !== "gate1" && room.room !== "gate2");
        return rooms;
    });

    const { data: envData, isError: envError, refetch } = useQuery(['environmentData', selectedLocation], async () => {
        const data = await fetchApi(`getEnv?loc=${selectedLocation.room}&order=DESC`);
        let realData = data.environment.data[0]; //index of the data you want from array 0 = most recent
        let inTime = realData.Timestamp.split(" ")[1].split(".")[0]
        if(inTime!=timeoutTime){
          timeout=timeout+1;
          if(timeout>=3){
            throw new Error("lost connection")
          }
        }else{
          if(!realData.error==""){
            throw new Error("no room in DB")
          }else{
            timeout=0;
            let newValues = {
              temp: realData.Temperature,
              noise: realData.NoiseLevel,
              light: realData.LightLevel
            };
            return newValues;         
          }
        }
    });
    
    useEffect(() => {
        if (locationError) {
            let newValues = {
              temp: "0",
              noise: "0",
              light: "0"
            };
            setValues(newValues);
        }
        if (envData) {
            setValues(envData);
        }
        if (envError) {
            let newValues = {
              temp: "0",
              noise: "0",
              light: "0"
            };
            setValues(newValues);
        }
    }, [locationData, locationError, envData, envError, selectedLocation]);

    useEffect(() => {
        const interval = setInterval(() => {
            refetch();
        }, fetchUpdateDelay());
        return () => clearInterval(interval);
    }, [selectedLocation]);

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

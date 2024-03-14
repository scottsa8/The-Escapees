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
    const dialSize = 170;
    const dialClassName="dial-container";

    
   

    const { data: locationData, isError: locationError } = useQuery('locations', async () => {
        const data = await fetchApi('getRooms');
        const rooms = data.rooms.data.filter(room => room.room !== "gate1" && room.room !== "gate2");
        return rooms;
    });

    const handleRoomClick = (roomName) => {
      const room = locationData.find(location => location === roomName);
      console.log(room)
      setSelectedLocation(roomName);
  };

    const { data: envData, isError: envError, refetch } = useQuery(['environmentData', selectedLocation], async () => {
        const data = await fetchApi(`getEnv?loc=${selectedLocation}&order=DESC`);
        let realData = data.environment.data[0]; //index of the data 
        if(realData==undefined){
            // throw new Error("no room in DB")
        }else if(realData.error =="Room not found"){
            // throw new Error("no room in DB")
        }else{
            let newValues = {
              temp: realData.Temperature,
              noise: realData.NoiseLevel,
              light: realData.LightLevel
            };
            return newValues;         
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
                    <EnvironmentBox dialClassName={dialClassName} size={dialSize} measurement="Temp" value={values["temp"]} max={fetchApi(`getMax?loc=${selectedLocation}&type=${max_temperature}`)}/>
                    <EnvironmentBox dialClassName={dialClassName} size={dialSize} measurement="Light" value={values["light"]} max={fetchApi(`getMax?loc=${selectedLocation}&type=${max_light_level}`)}/>
                    <EnvironmentBox dialClassName={dialClassName} size={dialSize} measurement="Noise" value={values["noise"]} max={fetchApi(`getMax?loc=${selectedLocation}&type=${max_noise_level}`)}/>
                </div>
            <LocationCountBox onRoomClick={handleRoomClick} />
            </div>
        </div>
             
    )
}

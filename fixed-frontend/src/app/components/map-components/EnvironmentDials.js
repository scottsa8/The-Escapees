import { useState, useEffect } from "react";
import EnvironmentBox from "../EnvironmentBox";
import { network } from "../../layout";
import { getCookie } from "../cookies";
import { getEnvData as fetchEnvData } from "../apiFetcher";

const EnvironmentDials = ({roomName}) => {
    let timeout;
    const dialSize = 80;
    const dialClassName = "map-dial-container"
    const [values, setValues] = useState({
        temp: "0",
        light: "0",
        noise: "0"
    });

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


    //gets the data
    const getEnvData = async () => {
        let d= new Date();
        let timeoutTime= d.toTimeString().split(" ")[0]
        try{    
            const data = await fetchEnvData(roomName, 'DESC', false);
            let realData = data[0]; //index of the data you want from array 0 = most recent
            let inTime = realData['timestamp'].split(" ")[1].split(".")[0]
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
                        temp: realData['temp'].split(".")[0],
                        noise: realData['noise'].split(".")[0],
                        light: realData['light'].split(".")[0]
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
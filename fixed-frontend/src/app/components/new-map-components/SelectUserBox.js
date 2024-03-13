import { useEffect, useState } from "react";
import { fetchApi } from "../apiFetcher";
import { useQuery } from "react-query";
import {getCookie, setCookie} from "../cookies"
import React from "react";

const SelectUserBox = () => {

    const [trackedUsers, setTrackedUsers] = useState([""]);//Default values for testing
    const {data, error, refetch} = useQuery('usernames', () => fetchApi('getTracked'));//TODO


    useEffect(() => {
      
        if(error || !data){
            console.error(error);
            refetch();
        }else{
            console.log(data)

            //maps the data to get an array of trackedNames
            const trackedNames = data.names.data
            .map(roomObj => roomObj.username);
            setTrackedUsers(trackedNames);
            console.log(trackedNames)
        }
      
    }, [data, error]);


    return ( 
        <div className="userSelector"> 
        <select onLoad={(e) => setCookie("trackedUser",e.target.value)} onChange={(e) => setCookie("trackedUser",e.target.value)} className="p-2 border rounded-md shadow-md">
            {trackedUsers.map((trackedUsers, index) => (
                <option key={index} value={trackedUsers}>{trackedUsers}</option>
            ))}
        </select>
        </div>

    );
}
 
export default SelectUserBox;
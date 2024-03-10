import { useEffect, useState } from "react";
import { fetchApi } from "../apiFetcher";
import { useQuery } from "react-query";
import React from "react";

const SelectUserBox = ({onUserChange}) => {

    const [trackedUsers, setTrackedUsers] = useState([" ", "Hannah"]);//Default values for testing
    const [selectedUser, setSelectedUser] = useState("");
    const {data, error, refetch} = useQuery('trackedNames', () => fetchApi('/getTracked'));//TODO

    const handleUserChange = (e) => {
        setSelectedUser(e.target.value);
        onUserChange(e.target.value);
    };

    useEffect(() => {
        if(error || !data){
            console.error(error);
            return;
        }
        consolge.log(data)

        ///THIS NEEDS TO BE FINISHED, COMPARE TO ROOMSELECTOR.JS
        const trackedNames = data.names.data//This will need checking idk if '.names' is correct
            .map(nameObj => nameObj.name)
            .filter(roomName => roomName && !roomName.includes('TEMP, PLEASE CHANGE'));//Probably won't work
        setTrackedUsers(trackedNames);

    }, [data, error, refetch]);


    return ( 
        <div className="userSelector"> 
        <select value={selectedUser} onChange={handleUserChange} className="p-2 border rounded-md shadow-md">
            {trackedUsers.map((trackedUsers, index) => (
                <option key={index} value={location}>{location}</option>
            ))}
        </select>
        </div>

    );
}
 
export default SelectUserBox;
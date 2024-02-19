// TODO: Implement fetchData to get no of users from server

import { useEffect, useState } from "react";
import { network } from "../layout";


function RoomCard({ roomName, prisonerCount, guardCount, onClick, isSelected}) {


    const cardStyle = isSelected ? { backgroundColor: '#1B2030', cursor: 'pointer' } : { cursor: 'pointer' };

    return (
      <div onClick={onClick} style={cardStyle} className="bg-white shadow-md rounded-lg p-4 m-4 max-w-sm w-60 dark:bg-gray-700 dark:text-blue-100">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-blue-300">{`${roomName}`}</h2>
        <p className="text-gray-600 mt-2 dark:text-blue-100">{`Prisoners: ${prisonerCount}`}</p>
        <p className="text-gray-600 mt-2 dark:text-blue-100">{`Guards: ${guardCount}`}</p>
      </div>
    );
} 


function LocationCount({location}){
    const [count,setCount] = useState(0)


    // useEffect(() => {
    //     fetch(`http://${network.ip}:${network.port}/getPeople?loc=${location}`)
    //       .then(response => response.json())
    //       .then(num => count = num);
    //   }, []);

    // const getPeople = async () => {
    //     const response = await fetch(`http://${network.ip}:${network.port}/getPeople?loc=${location}`)
    //     const data = await response.json();
        
    //     data.then((data) => setCount(data));
    // };

    // useEgetPeople()
    // useEffect(()=>{
    //     const getPeople = async () => {
    //         const response = await fetch(`http://${network.ip}:${network.port}/getPeople?loc=${location}`)
    //         const data = await response.json();
            
    //         data.then((data) => setCount(data));
    //     };
    //     getPeople()
    //     const interval=setInterval(()=>{
    //         getPeople()
    //         },10000)
       
       
    //       return()=>clearInterval(interval)
    // },[])

    return(
        <div className="flex flex-col w-12 min-h-49 border rounded border-neutral-900 m-0.5 grow">
            <label className="bg-neutral-600 text-center text-xl text-neutral-200">{location}</label>
            <label className="text-center text-9xl bg-orange-200">{count}</label>
        </div>
    )

}

export default function LocationCountBox({onRoomClick}){

    const [locations, setLocations] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState("Room1");

    useEffect(() => {
      fetch(`http://${network.ip}:${network.port}/getRooms`)
        .then(response => response.json())
        .then(data => {
          const roomNames = data.rooms.data.map(roomObj => roomObj.room);
          setLocations(roomNames);
        });
    }, []);

    

    // useEffect(() => {
    // const getLocations = async () => {
    //     const response = await fetch(`http://${network.ip}:${network.port}/getAllNames`)
    //     const data = await response.json();
    //     data.then((data) => setLocation(data));
    // };
    //     getLocations()

    // },[])

    return(
        
        // <div id="container" className="w-full flex flex-col border border-neutral-900 rounded m-0.5">
        //     <div className="bg-neutral-300 flex justify-center"> 
        //     <label className=" text-center text-xl text-neutral-900">Location Count</label>
        //     </div>
            
        //     <div id="content" className="flex">
        //         {locations.map( (location) => (
        //             <LocationCount
        //             location={location.name}/>
        //         ) )}
        //     </div>
        // </div>

    <div className="w-full min-w-0 flex flex-wrap justify-start space-between">
        {locations.map(room => (
        <RoomCard roomName={room} prisonerCount="1" guardCount="1" onClick={() => {setSelectedRoom(room); onRoomClick(room);}} isSelected={selectedRoom === room}/>
        ))}
    </div>

    )

}
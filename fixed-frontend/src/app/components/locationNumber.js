import { useEffect, useState } from "react";
import { network } from "../layout";


function RoomCard({ roomName, prisonerCount, guardCount }) {
    return (
      <div className="bg-white shadow-md rounded-lg p-4 max-w-sm w-full mx-auto dark:bg-gray-700 dark:text-blue-100">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-blue-200">{`Room ${roomName}`}</h2>
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

export default function LocationCountBox(){

    const locations = [
        { name: 'a', prisonerCount: 10, guardCount: 2 },
        { name: 'b', prisonerCount: 15, guardCount: 4 },
        { name: 'c', prisonerCount: 8, guardCount: 1 },
      ];
    // const [locations,setLocation] = useState([])

    // useEffect(() => {
    //     fetch(`http://${network.ip}:${network.port}/getAllNames`)
    //       .then(response => response.json())
    //       .then(names => locations = names);
    //   }, []);

    

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

        <div className="flex justify-evenly min-w-0 items-center p-4">
            {locations.map(room => (
            <RoomCard key={room.id} roomName={room.name.toUpperCase()} prisonerCount={room.prisonerCount} guardCount={room.guardCount} />
            ))}
        </div>

    )

}
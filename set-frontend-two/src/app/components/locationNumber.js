import { useEffect, useState } from "react";
import { network } from "../layout";



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
    useEffect(()=>{
        const getPeople = async () => {
            const response = await fetch(`http://${network.ip}:${network.port}/getPeople?loc=${location}`)
            const data = await response.json();
            
            data.then((data) => setCount(data));
        };
        getPeople()
        const interval=setInterval(()=>{
            getPeople()
            },10000)
       
       
          return()=>clearInterval(interval)
    },[])

    return(
        <div className="flex flex-col w-12 min-h-49 border rounded border-neutral-900 m-0.5 grow">
            <label className="bg-neutral-600 text-center text-xl text-neutral-200">{location}</label>
            <label className="text-center text-9xl bg-orange-200">{count}</label>
        </div>
    )

}

export default function LocationCountBox(){

    // const locations = [
    //     { name:"Room1"},
    //     { name:"Room2"},
    //     { name:"Room3"},
        
    // ]
    const [locations,setLocation] = useState([])

    // useEffect(() => {
    //     fetch(`http://${network.ip}:${network.port}/getAllNames`)
    //       .then(response => response.json())
    //       .then(names => locations = names);
    //   }, []);

    

    useEffect(() => {
    const getLocations = async () => {
        const response = await fetch(`http://${network.ip}:${network.port}/getAllNames`)
        const data = await response.json();
        data.then((data) => setLocation(data));
    };
        getLocations()

    },[])

    return(
        
        <div id="container" className="w-full flex flex-col border border-neutral-900 rounded m-0.5">
            <div className="bg-neutral-300 flex justify-center"> 
            <label className=" text-center text-xl text-neutral-900">Location Count</label>
            </div>
            
            <div id="content" className="flex">
                {locations.forEach( (location) => (
                    <LocationCount
                    location={location}/>
                ) )}
            </div>
        </div>

    )

}
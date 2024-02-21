import { useEffect, useState } from "react";
import EnvironmentDials from "./EnvironmentDials";

const RoomInfoPopup = ({polygonClicked}) => {

    //Get the data from the polygon that is currently in use
    const polyPoints = polygonClicked.points;
    const polyID = polygonClicked.id;
    console.log("poly id"+polygonClicked.id);

    const [roomName, setRoomName] = useState("");
    const [nameAdded, setNameAdded] = useState(false);

    // Searches in local storage for the polygon
    function getPolyName(){
        //Get all key names from local storage
        var keys = Object.keys(localStorage);
        let selectedName = undefined;
        //search through data to find the polygon with the same ID
        for(let i=0; i<keys.length; i++){
            
            if(keys[i] === ("polygon"+polygonClicked.id)){
                
                try{
                    let polyData = JSON.parse(localStorage.getItem(keys[i]));
                    selectedName = polyData.name;
                    console.log("Found "+selectedName);
                    break;
                }catch(e){
                    
                }
            }

        }

        return selectedName;
    }

    function savePolygon(newName){
        localStorage.setItem("polygon"+polygonClicked.id, JSON.stringify({points: polygonClicked.points, name: newName, id: polygonClicked.id}));//Save the polygons points with it's name
    }

    const handleLoad = (e) => {
        let polyName = getPolyName();

        if(polyName != undefined){
            setRoomName(polyName);
            setNameAdded(true);
        }
    }

    //Ran ons 1st load
    useEffect(() => {
        
        return handleLoad;
        
    },[])

    return ( 
        <div>
            {!nameAdded && <label>
                Please enter the room name: 
                {/* Needs to be changed to a drop down with names */}
                <input type="text"></input>
                <button onClick={(e) => {
                    const newName = e.target.parentNode.childNodes[1].value
                    setRoomName(newName);
                    setNameAdded(true);
                    savePolygon(newName);

                }}>Enter</button>
                
            </label>}

            {/* Once a name has been added, load content of page */}
            {nameAdded &&
                <div>
                    <h1>{roomName} Data</h1>
                    <EnvironmentDials roomName = {roomName}></EnvironmentDials>
                </div>
            }

        </div>
    );
}

export default RoomInfoPopup;
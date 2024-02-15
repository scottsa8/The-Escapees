import { useState } from "react";

const RoomInfoPopup = ({polygonClicked}) => {

    //Get the data from the polygon that is currently in use
    const polyObj = polygonClicked.object;
    const polyPoints = polygonClicked.points;
    const polyName = polygonClicked.roomName;

    const [roomName, setRoomName] = useState("");
    const [nameAdded, setNameAdded] = useState(false);

    if(polyName){
        setRoomName(polyName);
        setNameAdded(true);
    }

    function savePolygon(name){
        localStorage.setItem("roomID"+name, JSON.stringify(polyPoints));//Save the polygons points with it's name
        console.log(name)
    }

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
                </div>
            }

        </div>
    );
}

export default RoomInfoPopup;
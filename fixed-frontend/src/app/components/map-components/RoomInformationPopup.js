import { useState } from "react";

const RoomInfoPopup = () => {

    const [roomName, setRoomName] = useState("");
    const [nameAdded, setNameAdded] = useState(false);

    return ( 
        <div>
            {!nameAdded && <label>
                Please enter the room name: 
                {/* Needs to be changed to a drop down with names */}
                <input type="text"></input>
                <button onClick={(e) => {
                    setRoomName(e.target.parentNode.childNodes[1].value);
                    setNameAdded(true);
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
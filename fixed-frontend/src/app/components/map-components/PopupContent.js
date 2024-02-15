import 'leaflet/dist/leaflet.css'
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import "leaflet-draw/dist/leaflet.draw.css";
import { send } from 'process';
import { useEffect, useState } from 'react';

const CurrentDataContents = () => {
    return(
    <h1>
        Data
    </h1>)
}

const NameSelect = () => {
    return (
        <form>
            <label>
                Please enter the room name:
                <input type="text" onChange={(e) => {
                    setRoomName(e.target.value);
                    setCurrentPopupContent(popupContents.currentDataPage.page)
                    }} name="room-name"></input>
            </label>
        </form>
    );
}

//The possible contents of the popup
const popupContents = {
    nameSelectPage: {page: <NameSelect/>},
    currentDataPage: {page: <CurrentDataContents/>}
}

const PopupContent = () => {
    const [roomName, setRoomName] = useState("");
    const [currentPopupContent, setCurrentPopupContent] = useState(popupContents.nameSelectPage.page);

    useEffect(() => {
    //The popup contents have changed 
    

    }, [currentPopupContent])

    return (
        {currentPopupContent}
    );
}


 
export default PopupContent;
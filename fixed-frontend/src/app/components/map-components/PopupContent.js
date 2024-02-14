import 'leaflet/dist/leaflet.css'
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import {Popup} from 'react-leaflet';
import "leaflet-draw/dist/leaflet.draw.css";


const sendName = () => {}

const PopupContent = () => {
    return ( 
        <form>
            <label>
                Please enter the room name:
                <input type="text" name="room-name"></input>
            </label>
            <button onClick={sendName}>Enter</button>
        </form>
        
     );
}
 
export default PopupContent;
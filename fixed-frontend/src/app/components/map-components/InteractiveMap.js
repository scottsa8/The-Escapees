import 'leaflet/dist/leaflet.css'
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import { MapContainer, TileLayer, Marker, Popup} from 'react-leaflet';

const centralLocation = [51.505, -0.09];//default for now
const zoom = 12;

const InteractiveMap = () => {
    return ( 
            <MapContainer className="interactive-map" style={{height: "100vh", width: "100vw"}} center={centralLocation} zoom = {zoom} scrollWheelZoom={false}>
                {/* Get data from OSM */}
                <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>

                {/* Add a marker to the center of the map */}
                <Marker position={centralLocation}>
                    <Popup>
                        Hello World!
                    </Popup>
                </Marker>

            </MapContainer>
     );
}
 
export default InteractiveMap;
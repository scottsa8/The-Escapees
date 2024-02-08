import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer } from 'react-leaflet';

const centralLocation = [51.505, -0.09];//default for now
const zoom = 12;

const InteractiveMap = () => {
    return ( 
        <div className="interactive-map">
            <MapContainer center={centralLocation} zoom = {zoom} scrollWheelZoom={false}>
                {/* Get data from OSM */}
                <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>

                {/* Add a marker to the center of the map */}
                {/* <Marker position={centralLocation}>
                    <Popup>
                        Hello World!
                    </Popup>
                </Marker> */}

            </MapContainer>
        </div>
     );
}
 
export default InteractiveMap;
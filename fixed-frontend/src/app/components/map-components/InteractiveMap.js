import 'leaflet/dist/leaflet.css'
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import { MapContainer, TileLayer, Marker, Popup, FeatureGroup} from 'react-leaflet';
import "leaflet-draw/dist/leaflet.draw.css";
import { useRef } from 'react';
import { EditControl } from 'react-leaflet-draw';
import { useState } from 'react';


const lancasterPrisonLongLat = [54.05287592589365, -2.771636992389602];//default for now
const zoom = 17;


function getBounds(centerPoint){
    //Works out the bounds around the central chosen point
    
    var boundsA = [lancasterPrisonLongLat[0], lancasterPrisonLongLat[1]];
    var boundsB = [lancasterPrisonLongLat[0], lancasterPrisonLongLat[1]*-1];

    return (boundsA, boundsB)
}

const InteractiveMap = () => {

    const created = (e) => console.log(e);

    return ( 
        <div>
            <MapContainer className="interactive-map" style={{height: "100vh", width: "100vw"}} center={lancasterPrisonLongLat} zoom = {zoom} scrollWheelZoom={true}>

                <FeatureGroup>
                    <EditControl position="topright" created={created} />
                </FeatureGroup>

                {/* Get data from OSM */}
                <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>

                {/* Add a marker to the center of the map */}
                <Marker position={lancasterPrisonLongLat}>
                    <Popup>
                        Hello World!
                    </Popup>
                </Marker>

            </MapContainer>
        </div>
     );
}
 
export default InteractiveMap;
import 'leaflet/dist/leaflet.css'
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import { MapContainer, TileLayer, Marker, Popup, FeatureGroup, Tooltip} from 'react-leaflet';
import "leaflet-draw/dist/leaflet.draw.css";
import { useRef } from 'react';
import { EditControl } from 'react-leaflet-draw';
import { useState } from 'react';

const PolyTooltip = ({message}) => {
    return ( 
        <>
            <Tooltip sticky>{message}</Tooltip>
        </>
     );
}
 
export default PolyTooltip;
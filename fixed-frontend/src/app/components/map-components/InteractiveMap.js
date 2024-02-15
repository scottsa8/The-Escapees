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
const popupInformation = "LOCATION NAME";

//TODO: When created, user can add a location name to polygons
//      That data is stored in the db with the polygon ids and locations
//      Fetch data from the database and update popup info with location data

const InteractiveMap = () => {

    const [mapLayers, setMapLayers] = useState([]);

    //callback functions to create shapes on the map

    //when an object is created, store it
    const onCreate = (e) => {
        console.log(e)

        
        const {layerType, layer} = e;

        //if the user has drawn a polygon
        if(layerType === "polygon"){
            const {leafletID} = layer;//used to id which polygon to edit or delete

            setMapLayers( (layers) => [...layers, {id: leafletID, latlngs: layer.getLatLngs()[0]}]);
            layer.bindPopup(popupInformation);

            //opens popup when hovering over polygon
            layer.on({
                mouseover: e => {
                    layer.openPopup();
                },
                mouseout: e => {
                    layer.closePopup();
                }
            });

        }

    };

    //When you edit a polygon it saves the updated polygon values
    const onEdit = (e) => {
        console.log(e)

        const {layers: {_layers}} = e;

        Object.values(_layers).map(({leafletID, editing}) => {
            //find current layer id and update with new coordinates
            setMapLayers(
                (layers) => layers.map((l) => l.id === leafletID
                ? { ...l, latlngs: {...editing.latlngs[0]}} 
                : l//if not matching, return same object
                )
            );
        });
    };

    //remove the selected polygon
    const onDelete = (e) => {
        console.log(e)
        const {layers: {_layers}} = e;

        Object.values(_layers).map((leafletID) => {
            setMapLayers((layers) => layers.filter( (l) => l.id !== leafletID));
        });
    };

    return ( 
        <div>
            <MapContainer className="interactive-map" center={lancasterPrisonLongLat} zoom = {zoom} scrollWheelZoom={true}>

                {/* The sidepannel with shape drawing options */}
                <FeatureGroup>
                    <EditControl position="topright" onCreated={onCreate} onEdited={onEdit} onDeleted = {onDelete} draw={{
                        // Disabling the other draw features so there is onlt a polygon option
                      rectangle: false,
                      circle: false,
                      square: false,
                      polyline: false,
                      marker: false,  
                      circlemarker: false
                    }}/>
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
import 'leaflet/dist/leaflet.css'
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"
import { MapContainer, TileLayer, Marker, Popup, FeatureGroup, Polyline} from 'react-leaflet';
import "leaflet-draw/dist/leaflet.draw.css";
import { EditControl } from 'react-leaflet-draw';
import { useEffect, useState } from 'react';
import RoomInfoPopup from './RoomInformationPopup';
import LoadedPolygon from './LoadedPolygon.js';

const lancasterPrisonLongLat = [54.05287592589365, -2.771636992389602];//default for now
const zoom = 17;
//TODO: When created, user can add a location name to polygons
//      That data is stored in the db with the polygon ids and locations
//      Fetch data from the database and update popup info with location data

const InteractiveMap = () => {

    const [mapLayers, setMapLayers] = useState([]);
    const [savedData, setSavedData] = useState(false);
    const [showDataBox, setShowDataBox] = useState(false);
    const [selectedPolygon, setSelectedPolygon] = useState(null);
    const [polygons, setPolygons] = useState([]);
    
    const closeDataPage = () => {
        setShowDataBox(false);
    };

    //Re-write the polygon list to not have any duplicate polygons
    function removeDoubleSaves(polygonList){ 

        let newPolygonList = polygonList;

        for(let i=0; i<newPolygonList.length; i++){

            for(let j=i; j<newPolygonList.length; j++){

                //so you don't compare against self
                if(i!=j){

                    if(JSON.stringify(newPolygonList[i]) == JSON.stringify(newPolygonList[j])){
                        
                        newPolygonList.splice(j,1);//remove current polygon object from list
                        j--;

                    }

                }

            }

        }

        return newPolygonList;
    }

    function loadSavedPolygons(){
       
        var keys = Object.keys(localStorage);
        let polygonList = polygons;

        for(let i=0; i<keys.length; i++){

            try{
                let currentPolygon =  JSON.parse(localStorage.getItem(keys[i]))
                let points = currentPolygon.points;
                if(points){
                    
                    setSavedData(true);
                    polygonList.push(currentPolygon);

                }
            }catch(e){
                //If the saved data isn't a polygon
            }
        }

        setPolygons(removeDoubleSaves(polygonList));

    }

    //callback functions to create shapes on the map
    //when an object is created, store it
    const onCreate = (e) => {
        
        const {layerType, layer} = e;

        //if the user has drawn a polygon
        if(layerType === "polygon"){
            const {leafletID} = layer;//used to id which polygon to edit or delete

            setMapLayers( (layers) => [...layers, {id: leafletID, latlngs: layer.getLatLngs()[0]}]);

            const polyInfo = {points: layer.getLatLngs()[0], id: layer._leaflet_id}; //info that needs to be saved to draw a polygon

            setSelectedPolygon(polyInfo);

            //If this polygon is clicked
            layer.on('click',() => {
                //Show the data box
                setSelectedPolygon(polyInfo)
                setShowDataBox(true);  
            });

        }

    };

    //When you edit a polygon it saves the updated polygon values
    const onEdit = (e) => {

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

    useEffect(() => {
        return(loadSavedPolygons());
    },[]);


    return ( 
        <div>
            <MapContainer className="interactive-map" center={lancasterPrisonLongLat} zoom = {zoom} scrollWheelZoom={true}>

                {/* The sidepannel with shape drawing options */}
                <FeatureGroup>
                    <EditControl position="topleft" onCreated={onCreate} onEdited={onEdit} onDeleted = {onDelete} draw={{
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

                {/* Loads any polygons added to local storage */}
                {savedData && <LoadedPolygon polygons={polygons}/>}
                

            </MapContainer>
            <div className="overlay-data-box">
                {showDataBox && <div style={{
                    position: "absolute",
                    top: "200px",
                    left: "100px",
                    backgroundColor: "white",
                    padding: "10px",
                    borderRadius: "5px",
                    zIndex: "1000"
                }}>
                    <RoomInfoPopup polygonClicked = {selectedPolygon}/>
                    <button onClick={closeDataPage}>close x</button>
                </div>}
            </div>
        </div>
     );
}
 
export default InteractiveMap;
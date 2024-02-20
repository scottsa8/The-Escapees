import {Polygon} from 'react-leaflet';
import { useState } from 'react';

//Manages the saves for polygons on screen when created
const LoadedPolygon = ({polygons, openDataPage}) => {

    const [selectedPolygon, setSelectedPolygon] = useState(""); 
    const [showDataPage, setShowDataPage] = useState(false);

    function updatePolygonSave(polygon, event){
        
        let newPolyID = event.target._leaflet_id;
        
        //if it needs updating
        if(newPolyID != polygon.id){

            // Create a new polygon with a the new ID
            localStorage.setItem("polygon"+newPolyID, JSON.stringify({points: polygon.points, name: polygon.name, id: newPolyID}));
        
            localStorage.removeItem("polygon"+polygon.id);//removes old saved data
        }
        
    }

    //Will find the polygon that has been clicked and sets the selected polygon
    function findSelectedPolygon(polygonID){
        var keys = Object.keys(localStorage);

        for(let i=0; i<keys.length; i++){

            //found a match
            if(keys[i] === ("polygon"+polygonID)){
                try{
                    let selectedPolygon = JSON.parse(localStorage.getItem(keys[i]));
                    setSelectedPolygon(selectedPolygon.name);
                    console.log("Polygone selected");
                    break;
                }catch(e){
                    console.log("Incorrect polygon save accessed");
                }
            }
        }

    }

    return ( 
        <div className = "loaded-polygons">
            {
                polygons.map((polygon) =>(
                    
                    <Polygon key={polygon.id} positions={polygon.points} eventHandlers={{
                        add: (e) => {
                            //when a polygon is added, update it's save
                            updatePolygonSave(polygon, e);
                        },
                        click: (e) => {
                            console.log(e.target._leaflet_id+"clicked");
                            findSelectedPolygon(e.target._leaflet_id);
                            openDataPage(polygon);
                        }
                    }}/>                 
                ))

            }
        </div>
     );
}
 
export default LoadedPolygon;
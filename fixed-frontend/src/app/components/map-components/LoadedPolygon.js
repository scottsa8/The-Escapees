import { useEffect } from 'react';
import { useState } from 'react';
import {Polygon, Popup} from 'react-leaflet';

//Manages the saves for polygons on screen when created
const LoadedPolygon = ({polygons}) => {

    function updatePolygonSave(polygon, event){
        
        let newPolyID = event.target._leaflet_id;
        
        //if it needs updating
        if(newPolyID != polygon.id){

            // Create a new polygon with a the new ID
            localStorage.setItem("polygon"+newPolyID, JSON.stringify({points: polygon.points, name: polygon.name, id: newPolyID}));
        
            localStorage.removeItem("polygon"+polygon.id);//removes old saved data
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
                            console.log(e.target._leaflet_id);
                        }
                    }}/>                 
                ))

            }
        </div>
     );
}
 
export default LoadedPolygon;
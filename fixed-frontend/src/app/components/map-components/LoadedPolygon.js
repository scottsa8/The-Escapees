import {Polygon} from 'react-leaflet';

const LoadedPolygon = ({polygons}) => {

    //console.log(polygons);

    function updatePolygonSave(polygon, event){
        //console.log(event);
        let newPolyID = event.target._leaflet_id;
        console.log(newPolyID);
        localStorage.setItem("polygon"+newPolyID, JSON.stringify({points: polygon.points, name: polygon.name}));
        console.log("removing: "+polygon.id);
        localStorage.removeItem("polygon"+polygon.id);//removes old saved data
    }


    return ( 
        <div className = "loaded-polygons">
            {
                polygons.map((polygon) =>(
                    <Polygon key={polygon.id} positions={polygon.points} eventHandlers={{
                        add: (e) => {
                            //when a polygon is added, update it's save
                            updatePolygonSave(polygon, e);
                        }
                    }}/>                 
                ))

            }
        </div>
     );
}
 
export default LoadedPolygon;
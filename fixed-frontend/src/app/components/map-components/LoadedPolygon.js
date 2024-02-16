import {Polygon, Polyline} from 'react-leaflet';

const LoadedPolygon = ({polygons}) => {

    console.log(polygons);
    return ( 
        <div className = "loaded-polygons">
            {
                polygons.map((polygon) =>(
                    <Polygon key={polygon.id} positions={polygon.points}/>
                ))
            }
        </div>
     );
}
 
export default LoadedPolygon;
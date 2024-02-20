import {Polygon} from 'react-leaflet';

//Manages the saves for polygons on screen when created
const LoadedPolygon = ({polygons, openDataPage}) => {

    function updatePolygonSave(polygon, event){
        
        let newPolyID = event.target._leaflet_id;
        
        //if it needs updating
        if(newPolyID != polygon.id){

            console.log("Creating polygon "+newPolyID);
            // Create a new polygon with a the new ID
            localStorage.setItem("polygon"+newPolyID, JSON.stringify({points: polygon.points, name: polygon.name, id: newPolyID}));
        
            localStorage.removeItem("polygon"+polygon.id);//removes old saved data
        }
        
    }

    //Will find the polygon that has been clicked and returns the selected polygon
    function findSelectedPolygon(polygonID){
        var keys = Object.keys(localStorage);
        let selectedPolygon = undefined;

        for(let i=0; i<keys.length; i++){

            //found a match
            if(keys[i] === ("polygon"+polygonID)){
                try{
                    selectedPolygon = JSON.parse(localStorage.getItem(keys[i]));
                    break;
                }catch(e){
                    console.log("Incorrect polygon save accessed");
                }
            }
        }

        return selectedPolygon;

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
                            openDataPage(findSelectedPolygon(e.target._leaflet_id));
                        }
                    }}/>                 
                ))

            }
        </div>
     );
}
 
export default LoadedPolygon;
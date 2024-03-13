import RoomCanvas from "./RoomCanvas";
import SelectUserBox from "./SelectUserBox";

//A container containing all containers used to show the map page
const MapPage = () => {    

    return ( 
        <div className="MapPage card-container">
            <div className="flex mb-5">
                <h1 className="dark:text-sky-300 text-color-sky-700 p-4">Find User Location</h1>
                <SelectUserBox />
            </div>
            <RoomCanvas ></RoomCanvas>
        </div>
     );
}
 
export default MapPage;
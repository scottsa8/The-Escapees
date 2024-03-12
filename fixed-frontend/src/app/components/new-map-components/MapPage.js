import RoomCanvas from "./RoomCanvas";
import { useState } from "react";
import SelectUserBox from "./SelectUserBox";
import { fetchApi } from "../apiFetcher";
import MapLoader from "./MapLoader";

const MapPage = () => {

    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);


    

    return ( 
        <div className="MapPage card-container">
            <div className="flex mb-5">
                { <SelectUserBox /> }
            </div>
            {/* <MapLoader></MapLoader> */}
            <RoomCanvas ></RoomCanvas>
        </div>
     );
}
 
export default MapPage;
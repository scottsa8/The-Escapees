import RoomCanvas from "./RoomCanvas";
import { useState } from "react";
import {SelectUserBox} from "./SelectUserBox";

const MapPage = () => {

    const [selectedUser, setSelectedUser] = useState(null);

    return ( 
        <div className="MapPage">
            {/* <div className="flex mb-5">
                <SelectUserBox onLocationChange={setSelectedUser} />
            </div> */}
            <RoomCanvas selectedUser={selectedUser}></RoomCanvas>
        </div>
     );
}
 
export default MapPage;
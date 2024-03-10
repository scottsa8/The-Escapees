import RoomCanvas from "./RoomCanvas";
import { useState } from "react";
import SelectUserBox from "./SelectUserBox";

const MapPage = () => {

    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (e) =>{
        let selectedFile = e.target.files[0];
        console.log(selectedFile);
    }

    return ( 
        <div className="MapPage">
            <div className="flex mb-5">
                {/* <SelectUserBox onLocationChange={setSelectedUser} /> */}
            </div>
            <form>
                <input type={"file"} onChange={handleFileChange} accept={".csv"}></input>
            </form>
            <RoomCanvas selectedUser={selectedUser}></RoomCanvas>
        </div>
     );
}
 
export default MapPage;
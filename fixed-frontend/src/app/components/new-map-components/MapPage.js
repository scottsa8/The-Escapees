import RoomCanvas from "./RoomCanvas";
import { useState } from "react";
import SelectUserBox from "./SelectUserBox";

const MapPage = () => {

    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (e) =>{
        let selectedFile = e.target.files[0];
        
        const fileReader = new FileReader();
        fileReader.readAsText(selectedFile);

        //reads the csv file here
        fileReader.onload = (readerEvent) => {
            const csvContent = fileReader.result;
            console.log("Content ",csvContent);
        };

    }

    return ( 
        <div className="MapPage">
            <div className="flex mb-5">
                { <SelectUserBox /> }
            </div>
            <form>
                <input type={"file"} onChange={handleFileChange} accept={".csv"}></input>
            </form>
            <RoomCanvas ></RoomCanvas>
        </div>
     );
}
 
export default MapPage;
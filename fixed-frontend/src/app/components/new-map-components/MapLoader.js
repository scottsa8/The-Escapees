const MapLoader = () => {

    /**
     * Checks to see if the room data is valid
     * @param {*} rooms Room objects
     * @param {*} doors Door objects
     * @returns {*} true if the data is valid
     */
    function checkValid(rooms, doors){

        let valid = false;
        let validRooms = 0;

        //coordinates are put into a valid format to be sent to the database
        for(let i=0; i<rooms.length; i++){

            let oldCoords = rooms[i].coords;
            let newCoords = [];

            //copy existing coords but parse to an integer
            for(let j=0; j<oldCoords.length; j++){
                let currentCoords = oldCoords[j].split(",")
                newCoords.push([parseInt(currentCoords[0]), parseInt(currentCoords[1])]);
            }
            
            rooms[i].coords = newCoords;//replace coordinates

            //check if the rooms have valid doors
            if(rooms[i].doors.length != 0){
                console.log(rooms[i].doors);
                //search through the doors linked to current room
                for(let j =0; j<rooms[i].doors.length; j++){

                    let doorsFound = 0;

                    //Search through doors
                    for(let k =0; k<doors.length; k++){
                        let found = false;
                        //if the names of the doors match
                        if(found == false){
                            if(doors[k].name == rooms[i].doors[j]){
                                //valid door
                                doorsFound = doorsFound + 1;
                                found = true
                                break;
                            }
                        }
                        
                    }

                    //If all the doors are valid for that room
                    if(doorsFound == rooms[i].doors.length){
                        validRooms = validRooms + 1;
                    }else{
                        console.log("Invalid door found");
                    }

                }
            }else{
                //if there are no doors, then it is valid
                validRooms = validRooms + 1;
            }

        
        }
        //if all the doors for all rooms are valid
        if(validRooms == rooms.length){
            valid = true;
        }

        return valid;

    }

    //loads the loaded rooms and the doors to the database
    async function loadToDatabase(rooms, doors){
        for(let i=0;i<rooms.length;i++){
            const data = await fetchApi(`setupMap?roomName=${rooms[i].name}&points=${rooms[i].coords[0][0]},${rooms[i].coords[0][1]},${rooms[i].coords[2][0]},${rooms[i].coords[2][1]}`)
            console.log(data)
        }
    }


    const handleFileChange = (e) =>{

        let rooms = [];
        let doors = [];

        let selectedFile = e.target.files[0];
        
        const fileReader = new FileReader();
        fileReader.readAsText(selectedFile);

        //reads the csv file here
        fileReader.onload = (readerEvent) => {
            const csvContent = fileReader.result;
            
            let allData = csvContent.split("\n");//split for each row
            let data = [];
            
            //loop through each row of unformatted data
            for(let i= 0; i<allData.length; i++){
                allData[i] = allData[i].replace('\r', '');//format
                let dataPiece = allData[i].split(',');//split by comma

                if(dataPiece != ['']){
                    data.push(dataPiece);
                }
                
            }

            //Loop though formatted data
            for(let i =0; i<data.length; i++){
                let drawType = data[i][0];

                if(drawType == "Room"){
                    //Data for creating a room
                    try{
                        let currentRoom = {
                            name: data[i][1], 
                            coords: [data[i][2].replace('!',','),data[i][3].replace('!',','),data[i][4].replace('!',','),data[i][5].replace('!',',')],
                            doors: [null]
                        }

                        //if there are doors for a room. Add the name of the door to the room
                        if(data[i].length > 6){
                            var doorNames = [];
                            //find the number of doors 
                            for(let j = 6; j<data[i].length; j++){
                                if(data[i][j] != ''){
                                    doorNames.push(data[i][j]);
                                }
                            }

                            //making sure a blank array isn't added
                            if(doorNames != ['']){
                                currentRoom.doors = doorNames;
                            }
                            
                        }

                        rooms.push(currentRoom);//add the read room to an array
                    }catch(e){
                        console.log("Invalid Room format");
                    }
                    
                }
                else if(drawType == "Door"){
                    //data for creating a door
                    try{
                        let currentDoor = {
                            name: data[i][1],
                            location: [data[i][2].replace('!',',')]
                        }
    
                        doors.push(currentDoor);
                    }catch(e){
                        console.log("Invalid Door format");
                    }


                }
            }
            
            let validData = checkValid(rooms, doors);
            console.log(validData);
            console.log(rooms);
            console.log(doors);

            //if the uploaded data is valid, load it to the database
            if(validData == true){
                loadToDatabase(rooms, doors);
            }else{
                console.log("Invalid data, please check CSV format");
            }

        };

    }
    return ( 
    <form>
        <input type={"file"} onChange={handleFileChange} accept={".csv"}></input>
    </form> );
}
 
export default MapLoader;
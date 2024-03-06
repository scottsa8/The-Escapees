import { useEffect, useRef } from "react";
import {getEnvData} from "../apiFetcher";

const RoomCanvas = () => {

    const CANVAS_WIDTH = 1000;
    const CANVAS_HEIGHT = 1000;
    const SECOND = 1000;


    const canvasRef = useRef(null);
    const contextRef = useRef(null);

    const ICON_SIZE = 30;
    let userIcon;
    let openLockIcon;
    let closedLockIcon;
    let tempIcon;
    let lightIcon;
    let noiseIcon;

    class Door{

        //sets coords for the corners of the 
        #setCoords(size, location){
            size = size/2;
            let x = location[0];
            let y = location[1];

            this.coords = [[x-size,y-size],[x+size, y-size],[x+size, y+size],[x-size, y+size]];
        }

        constructor(name, location){
            this.doorName = name;
            this.location = location;//the center point for the box representing the door
            this.size = 50;//50pixels in height and width
            this.#setCoords(this.size, location);
            this.doorLocked = true;
        }

        //draws the room
        draw(fillColour, borderColour){
            //defining colours used
            contextRef.current.fillStyle = fillColour;
            contextRef.current.strokeStyle = borderColour;

            contextRef.current.beginPath();

            //move to starting coord
            contextRef.current.moveTo(this.coords[0][0], this.coords[0][1]);

            for(let i=0; i<this.coords.length; i++){

                if(i+1 < this.coords.length){
                    //draw to next coordinate
                    contextRef.current.lineTo(this.coords[i+1][0],this.coords[i+1][1]);
                }else{
                    //draw back to the first coordinate to complete polygon
                    contextRef.current.lineTo(this.coords[0][0], this.coords[0][1]);
                }
            }

            //draw the shape
            contextRef.current.closePath();
            contextRef.current.fill();
            contextRef.current.stroke();

            if(this.doorLocked == true){
                console.log("Drawing door lock");
                contextRef.current.drawImage(closedLockIcon, this.location[0]-ICON_SIZE/2, this.location[1]-ICON_SIZE/2, ICON_SIZE, ICON_SIZE);
            }else{
                contextRef.current.drawImage(openLockIcon, this.location[0]-ICON_SIZE/2, this.location[1]-ICON_SIZE/2, ICON_SIZE, ICON_SIZE);
            }
        }
        //sets true if the door is locked
        setDoorLocked(status){
            this.doorLocked = status;

            if(this.doorLocked){
                //Change colour to green
                this.draw("#C7FAC4", "black");
            }else{
                //set to red for "unlocked"
                this.draw("#EABBBB", "black");
            }
        }
    }

    class Room {
        //sets the bounds used to detect a user click
        #setBounds(coordinates){
            //search through coordinates and find smallest and largest x and y vals

            let minX = coordinates[0][0];
            let minY = coordinates[0][1];
            let maxX = coordinates[0][0];
            let maxY = coordinates[0][1];

            for(let i=0; i<coordinates.length; i++){

                if(coordinates[i][0] < minX){
                    minX = coordinates[i][0];
                }
                if(coordinates[i][0] > maxX){
                    maxX = coordinates[i][0];
                }
                if(coordinates[i][1] < minY){
                    minY = coordinates[i][1];
                }
                if(coordinates[i][1] > maxY){
                    maxY = coordinates[i][1];
                }
            }
            this.upperBound_x = maxX;
            this.upperBound_y = maxY;
            this.lowerBound_x = minX;
            this.lowerBound_y = minY;
        }
        //finds the center point between bounds
        #setCenterPoint(){
            this.centerPoint[0] = ((this.upperBound_x - this.lowerBound_x)/2) + this.lowerBound_x;
            this.centerPoint[1] = ((this.upperBound_y - this.lowerBound_y)/2) + this.lowerBound_y;
        }

        constructor(name, coordinates,doors){
            this.name = name;
            this.coords = coordinates;
            this.centerPoint = [];
            this.doors = doors;
            this.temp = 0;
            this.noise = 0;
            this.light = 0;
            this.user = false;//if the current user is in the room or not

            this.#setBounds(coordinates);
            this.#setCenterPoint()
        }

        //checks if the user has clicked this box
        checkClick(x, y){
            let roomFound = undefined;
            
            if((this.coords.length == 4) && (roomFound == undefined)){
                //if it is within the bounds
                if((x > this.lowerBound_x && x < this.upperBound_x) && (y > this.lowerBound_y && y < this.upperBound_y)){
                    roomFound = this;
                }  
            }
            return roomFound;
        }

        drawDoors(fillColour, borderColour){
            if(this.doors == null){
                return;
            }
            for(let i=0; i<this.doors.length; i++){
                this.doors[i].draw(fillColour, borderColour);
            }
        }

        draw(fillColour, borderColour){
            //defining colours used
            contextRef.current.fillStyle = fillColour;
            contextRef.current.strokeStyle = borderColour;

            contextRef.current.beginPath();

            //move to starting coord
            contextRef.current.moveTo(this.coords[0][0], this.coords[0][1]);

            for(let i=0; i<this.coords.length; i++){

                if(i+1 < this.coords.length){
                    //draw to next coordinate
                    contextRef.current.lineTo(this.coords[i+1][0],this.coords[i+1][1]);
                }else{
                    //draw back to the first coordinate to complete polygon
                    contextRef.current.lineTo(this.coords[0][0], this.coords[0][1]);
                }
            }

            //draw the shape
            contextRef.current.closePath();
            contextRef.current.fill();
            contextRef.current.stroke();   

            //drawing text
            contextRef.current.fillStyle = "black";
            contextRef.current.font = "30px Arial";
            contextRef.current.textAlign = "center";
            contextRef.current.fillText(this.name, this.centerPoint[0], this.lowerBound_y + 40);

            //if there is a user in the room, draw it
            if(this.user == true){
                contextRef.current.drawImage(userIcon, this.centerPoint[0]-ICON_SIZE/2, this.centerPoint[1]-ICON_SIZE/2, ICON_SIZE, ICON_SIZE);
                console.log("Drawing user");
            }

        }

        //sets the current environmental data of the room
        setEnvironmentalData(temp, noise, light){
            this.temp = temp;
            this.noise = noise;
            this.light = light;
        }

        //sets the room colour to red
        alarm(){
            refreshCanvas();
            this.draw("#EABBBB", "Black");
            this.drawDoors("#D8E0E6","black");
        }

    }

    const doorA = new Door("Office Side", [400, 110]);
    const doorB = new Door("Office Main", [285, 200]);

    const rooms = [
        new Room("Office", [[30,20],[400,20],[400,200],[30,200]],[doorA, doorB]), 
        new Room("Kitchen", [[500,20],[870,20],[870,200],[500,200]],null)
    ];

    //draw every room to the canvas
    const drawRooms = () =>{
        for(let j=0; j<rooms.length; j++){
            rooms[j].draw("#D8E0E6","black")
            rooms[j].drawDoors("#D8E0E6","black")
        }
    }

    //clears and redraws the rooms
    function refreshCanvas(){
        contextRef.current.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        drawRooms();
    }

    //needs to be tested with data
    function setAllRoomData(){
        for(let i=0; i<rooms.length; i++){
            //gets and sets the current environmental data
            let envData = getEnvData(rooms[i].name,"ASC", false);
            rooms[i].setEnvironmentalData(envData.temp, envData.noise, envData.light);

            //gets and sets the current location data
            
            //gets and sets the current door data???

        }
    }

    const handleClick = (event) => {

        //gets coordinates of where the client has clicked on the canvas
        const userX = event.clientX - event.target.offsetLeft;
        const userY = event.clientY - event.target.offsetTop;
    
        let roomFound = undefined;

        refreshCanvas();

        //for a room with 4 sides
        for(let i=0; i<rooms.length; i++){
            //check if the user has clicked within the bounds of one of the drawn rooms
            roomFound = rooms[i].checkClick(userX, userY);
            if(roomFound){
                break;
            }
        }
        //if a room has been clicked, change its colour
        if(roomFound != undefined){
            console.log("Clicked "+roomFound.name);
            roomFound.user = true;
            
            try{
                roomFound.doors[0].doorLocked = false;
                roomFound.doors[1].doorLocked = false;
            }catch(e){

            }


            refreshCanvas();         
        }
    }

    function setIcons() {
        userIcon  = new Image();
        openLockIcon = new Image();
        closedLockIcon = new Image();
        tempIcon = new Image();
        lightIcon = new Image();
        noiseIcon = new Image();

        userIcon.src="/userSolid.png";
        openLockIcon.src = "/lock-open-solid.png";
        closedLockIcon.src = "/lock-solid.png";
        tempIcon.src = "/temperature-high-solid.png"
        noiseIcon.src = "/volume-high-solid.png";
        lightIcon.src = "/sun-solid.png";
    }

    useEffect(() => {
        console.log("Generating canvas");

        const canvas = canvasRef.current;//finds canvas element
        const context = canvas.getContext("2d");//the drawing object
        contextRef.current = context;

        //will fetch the data periodically from the server
        const dataFetch = setInterval(() => {
            setAllRoomData();
        }, SECOND);

        setIcons();
        drawRooms();

    },[])

    return ( 
        <>
        <canvas
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            ref={canvasRef}
            onClick={handleClick}
        >
        </canvas>
        </>
    );
}
 
export default RoomCanvas;
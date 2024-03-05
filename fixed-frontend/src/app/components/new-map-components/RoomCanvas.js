import { useEffect, useRef} from "react";
import {getEnvData} from "../apiFetcher";
import Room from "./Room";
import Door from "./Door";

const RoomCanvas = () => {

    const CANVAS_WIDTH = 1000;
    const CANVAS_HEIGHT = 1000;
    const SECOND = 1000;

    const canvasRef = useRef(null);
    const contextRef = useRef(null);

    const ICON_SIZE = 30;

    const doorA = new Door("Office Side", [400, 110]);
    const doorB = new Door("Office Main", [285, 200]);

    const rooms = [
        new Room("Office", [[30,20],[400,20],[400,200],[30,200]],[doorA, doorB]), 
        new Room("Kitchen", [[500,20],[870,20],[870,200],[500,200]],null)
    ];

    //draw every room to the canvas
    const drawRooms = () =>{
        for(let j=0; j<rooms.length; j++){
            rooms[j].draw("#D8E0E6","black");
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
            rooms[i].setAndCheckEnvironmentalData(envData.temp, envData.noise, envData.light);

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

    //Initialise the images to be used
    function setIcons() {

        Room.ICON_SIZE = ICON_SIZE;
        Door.ICON_SIZE = ICON_SIZE;

        //adding the image paths
        Room.userIcon.src="/userSolid.png";
        Door.openLockIcon.src = "/lock-open-solid.png";
        Door.closedLockIcon.src = "/lock-solid.png";
        Room.tempIcon.src = "/temperature-high-solid.png"
        Room.noiseIcon.src = "/volume-high-solid.png";
        Room. lightIcon.src = "/sun-solid.png";

        //loading the image can take longer than drawing the icon to the screen
        Room.userIcon.onload = () => {refreshCanvas()};
        Door.openLockIcon.onload = () => {refreshCanvas()};
        Door.closedLockIcon.onload = () => {refreshCanvas()};
        Room.tempIcon.onload = () => {refreshCanvas()};
        Room.lightIcon.onload = () => {refreshCanvas()};
        Room.noiseIcon.onload = () => {refreshCanvas()};
    }

    useEffect(() => {
        console.log("Generating canvas");
        setIcons();
        const canvas = canvasRef.current;//finds canvas element
        const context = canvas.getContext("2d");//the drawing object
        contextRef.current = context;

        Door.contextRef = contextRef;
        Room.contextRef = contextRef;

        //will fetch the data periodically from the server
        const dataFetch = setInterval(() => {
            setAllRoomData();
        }, SECOND);
        
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
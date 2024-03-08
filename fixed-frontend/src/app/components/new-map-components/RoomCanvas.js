import { useEffect, useRef, useState} from "react";
import {fetchApi, getEnvData} from "../apiFetcher";
import Room from "./Room";
import Door from "./Door";
import { getCookie } from "../cookies";

const RoomCanvas = ({trackedUser}) => {

    const CANVAS_WIDTH = 1500;
    const CANVAS_HEIGHT = 600;
    const SECOND = 1000;

    const canvasRef = useRef(null);
    const contextRef = useRef(null);

    const ICON_SIZE = 20;

    let [trackedName, setTrackedName] = useState(trackedUser);

    // const doorA = new Door("Office Side", [400, 110]);
    // const doorB = new Door("Office Main", [285, 200]);

    const cellBlockD = new Door("Cell Block Door", [375,400]);
    const courtyardD = new Door("Courtyard Door", [200,475]);
    const canteenD = new Door("Canteen Door", [550,475]);
    const corridorD = new Door("Corridor Door", [700,400]);
    const receptionD = new Door("Reception Door", [750,475]);
    const visitorAreaD = new Door("Visitor Area Door", [925,400]);
    const staffRoomD = new Door("Staff Room Door", [750,125]);
    const cellAD = new Door("Cell A Door", [275,200]);
    const cellBD = new Door("Cell B Door", [425,200]);
    const cellCD = new Door("Cell C Door", [575,200]);

    const rooms = [
        // new Room("Office", [[30,20],[400,20],[400,200],[30,200]],[doorA, doorB]), 
        // new Room("Kitchen", [[500,20],[870,20],[870,200],[500,200]],null)
        new Room("Corridor",[[650,50],[750,50],[750,400],[650,400]],[corridorD]),
        new Room("Cell Block", [[200,200],[650,200],[650,400],[200,400]], [cellBlockD]),
        new Room("Courtyard", [[50,50], [200, 50], [200,550], [50,550]],[courtyardD]),
        new Room("Canteen", [[200,400],[550,400],[550,550],[200,550]],[canteenD]),
        new Room("Security Check", [[550,400],[750,400],[750,550],[550,550]],null),
        new Room("Reception", [[750,400],[1100,400],[1100,550],[750,550]],[receptionD]),
        new Room("Visitor Area", [[750,200],[1100,200],[1100,400],[750,400]],[visitorAreaD]),
        new Room("Staff Room", [[750,50],[1100,50],[1100,200],[750,200]],[staffRoomD]),
        new Room("Cell A", [[200,50],[350,50],[350,200],[200,200]],[cellAD]),
        new Room("Cell B", [[350,50],[500,50],[500,200],[350,200]],[cellBD]),
        new Room("Cell C", [[500,50],[650,50],[650,200],[500,200]],[cellCD])

    ];

    //draw every room to the canvas
    const drawRooms = () =>{
        for(let j=0; j<rooms.length; j++){
            rooms[j].draw("#D8E0E6","black");
        }
        //draw doors after rooms so the rooms don't overlap doors
        for(let i=0;i<rooms.length; i++){
            rooms[i].drawDoors("#D8E0E6","black");
        }
        
    }

    //clears and redraws the rooms
    function refreshCanvas(){
        contextRef.current.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        drawRooms();
    }

    //needs to be tested with data
    async function setAllRoomData(){

        let currentUserLocation = undefined;
        trackedName="Ethan"
        // TEST get the location of the current selected user
        console.log(trackedName)
        if(trackedName != undefined){
            //get the current location of the user
            currentUserLocation = await fetchApi("listAll?user="+trackedName+"&RT=true");//list of locations the user has been in
            currentUserLocation = currentUserLocation.locations.data[0].Location;
            console.log(trackedName+" is in "+currentUserLocation);
        }

        for(let i=0; i<rooms.length; i++){
            //gets and sets the current environmental data
            let envData = await getEnvData(rooms[i].name,"DESC", false) || [0,0,0];
            let data=envData[0]        
            Room.maxValues.temp = getCookie('tempNotification');
            Room.maxValues.light = getCookie('lightNotification');
            Room.maxValues.noise = getCookie('noiseNotification');

            //console.log("Mav vals: temp = "+Room.maxValues.temp+" light = "+Room.maxValues.light+" noise = "+Room.maxValues.noise);
            let temp;
            let noise;
            let light;
            try{
                temp=data.temp;
                noise=data.noise;
                light=data.light;
            }catch(e){
                temp=0;
                noise=0;
                light=0;
            }
            rooms[i].setAndCheckEnvironmentalData(temp,noise,light);
         
            //if this room is the one the tracked user is in, show the icon
            if(currentUserLocation != undefined && trackedName != undefined){
                if(currentUserLocation == rooms[i].name){
                    rooms[i].user = true;
                }else{
                    rooms[i].user = false;
                }
            }

            //gets and sets the current door data???
            if(rooms[i].doors != null){
                for(let j=0; j<rooms[i].doors.length; j++){
                    //return is boolean
                    //this.rooms[i].doors[j].doorLocked = fetchApi(doorname);
                    console.log(rooms[i].doors[j].name+" locked = "+rooms[i].doors[j].doorLocked);
                }
            }

        }


    }

    const handleClick = (event) => {

        //gets coordinates of where the client has clicked on the canvas
        const userX = event.clientX - event.target.offsetLeft;
        const userY = event.clientY - event.target.offsetTop;
    
        // let roomFound = undefined;
        // refreshCanvas();

        // //for a room with 4 sides
        // for(let i=0; i<rooms.length; i++){
        //     //check if the user has clicked within the bounds of one of the drawn rooms
        //     roomFound = rooms[i].checkClick(userX, userY);
        //     if(roomFound){
        //         break;
        //     }
        // }
        // //if a room has been clicked
        // if(roomFound != undefined){
        //     console.log("Clicked "+roomFound.name);
        //     roomFound.user = true;
            
        //     try{
        //         roomFound.doors[0].doorLocked = false;
        //         roomFound.doors[1].doorLocked = false;
        //     }catch(e){

        //     }

        //     refreshCanvas();         
        // }
    }

    //Initialise the images to be used
    function setIcons() {

        Room.ICON_SIZE = ICON_SIZE;

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
            setTrackedName(trackedUser);
            setAllRoomData();
            refreshCanvas();
        }, SECOND);
        
        //Load room data
        //If there is no room data/cannot connect: display, "cannot load rooms from database", load default?
        //Load room data
        //link rooms to the data coming in
        //


        drawRooms();
        refreshCanvas();
        return () => clearInterval(dataFetch);
    },[])

    return ( 
        <>
        <canvas id="main-canvas"
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
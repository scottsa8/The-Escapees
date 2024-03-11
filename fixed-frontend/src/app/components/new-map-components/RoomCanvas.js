import { useEffect, useRef, useState} from "react";
import {fetchApi, getEnvData} from "../apiFetcher";
import Room from "./Room";
import Door from "./Door";
import { getCookie } from "../cookies";

const RoomCanvas = () => {

    const CANVAS_WIDTH = 1500;
    const CANVAS_HEIGHT = 600;
    const SECOND = 1000;

    const canvasRef = useRef(null);
    const contextRef = useRef(null);

    const ICON_SIZE = 20;

    let trackedName="";

    //default doors
    const doorA = new Door("Office Side", [400, 110]);
    const doorB = new Door("Office Main", [285, 200]);

    //default rooms
    let rooms = [
        new Room("Office", [[30,20],[400,20],[400,200],[30,200]],[doorA, doorB]), 
        new Room("Kitchen", [[500,20],[870,20],[870,200],[500,200]],null)
    ];

    //draw every room to the canvas
    const drawRooms = () =>{
        //loadRooms();
        for(let j=0; j<rooms.length; j++){
            rooms[j].draw("#D8E0E6","black");
        }
        console.log(rooms)
        //draw doors after rooms so the rooms don't overlap doors
        for(let i=0;i<rooms.length; i++){
            // console.log(i)
            // console.log(rooms[i].doors)
            rooms[i].drawDoors("#D8E0E6","black");
        }
        
    }

    /**
     * Fetches the rooms from the database and creates corresponding objects ready to be drawn
     */
    async function loadRooms(){

        let tempRoomArr = [];//tempoary array to store created rooms in.

        //FETCH ROOMS FROM DB
        let roomData = await fetchApi("getAllRoomData");
        if(roomData!=undefined){
            roomData = roomData.rooms.data;
        }
        //create rooms
        try{
            for(let i=0;i<roomData.length;i++){
                let entry = roomData[i];
                    if(entry.Name==="gate1"||entry.Name==="gate2"){continue;}
                    //topleft
                    let tl=[parseInt(entry.TLC.split(",")[0]),parseInt(entry.TLC.split(",")[1])];
                    //top right
                    let tr=[parseInt(entry.TRC.split(",")[0]),parseInt(entry.TRC.split(",")[1])]
                    //bottom right
                    let br=[parseInt(entry.BRC.split(",")[0]),parseInt(entry.BRC.split(",")[1])]
                    //bottom left
                    let bl=[parseInt(entry.BLC.split(",")[0]),parseInt(entry.BLC.split(",")[1])]
    
                    //FETCH DOORS FROM DB
                    let doorData = await fetchApi("getAllDoorData?room="+entry.Name);
                    if(doorData!=undefined){
                        doorData = doorData.doors.data[0];
                    }
                    //create create the room with the door 
                    let door;
                    let room;
                    if(doorData==undefined){
                        room = new Room(entry.Name,[tl,tr,br,bl],null);
                    }else{
                        door = new Door(doorData.Name,[parseInt(doorData.coords.split(",")[0]),parseInt(doorData.coords.split(",")[1])])
                        room = new Room(entry.Name,[tl,tr,br,bl],[door]);
                    }            
                    //check if room already exists
                    if(tempRoomArr.some(r => r.name === entry.Name)){
                    }else{
                        //add it if it doesnt exist
                        tempRoomArr.push(room);
                    } 
                }
                rooms = tempRoomArr;
        }catch(e){
            //if you are unable to load rooms
            console.log("Unable to load rooms from database");

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
        trackedName=getCookie("trackedUser");
        // TEST get the location of the current selected user
        console.log(trackedName)
        if(trackedName != undefined){
            //get the current location of the user
            currentUserLocation = await fetchApi("listAll?user="+trackedName+"&RT=true");//list of locations the user has been in
            if(currentUserLocation!=undefined){
                try{
                    currentUserLocation = currentUserLocation.locations.data[0].Location;
                }catch(err){
                    currentUserLocation=""
                }
               
            }
            //console.log(trackedName+" is in "+currentUserLocation);
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
        loadRooms();
        setIcons();
        const canvas = canvasRef.current;//finds canvas element
        const context = canvas.getContext("2d");//the drawing object
        contextRef.current = context;

        Door.contextRef = contextRef;
        Room.contextRef = contextRef;

        //will fetch the data periodically from the server
        const dataFetch = setInterval(() => {
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
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
    // const doorA = new Door("Office Side", [400, 110]);
    // const doorB = new Door("Office Main", [285, 200]);

    const corridorDoor = new Door("Corridor Door",[350,300]);
    const gymDoor = new Door("Gym Door",[300,350]);
    const room1Door = new Door("Room 1 Door",[250,100]);
    const room2Door = new Door("Room 2 Door", [250,200]);
    const room3Door = new Door("Room 3 Door", [250,300]);
    const restaurantDoorA = new Door("Resturant Door A", [450,250]);
    const restaurantDoorB = new Door("Resturant Door B", [550,250]);
    const lobbyDoorA = new Door("Lobby Door A", [450,550]);
    const lobbyDoorB = new Door("Lobby Door B",[550,550]);
    const barDoorResturant = new Door("Bar Door Resturant", [650,100]);
    const barDoorBall = new Door("Bar Door Ballroom", [750,250]);
    const barDoorOut = new Door("Bar Door Out", [900,150]);
    const ballroomDoor = new Door("Ballroom Door", [650,350]);
    const ballroomDoorOut = new Door("Ballroom Door Out", [900,350]);
    
    //default rooms
    let rooms = [
        // new Room("Office", [[30,20],[400,20],[400,200],[30,200]],[doorA, doorB]), 
        // new Room("Kitchen", [[500,20],[870,20],[870,200],[500,200]],null)
        new Room("Room 1", [[50,50],[250,50],[250,150],[50,150]], [room1Door]),
        new Room("Room 2", [[50,150],[250,150],[250,250],[50,250]], [room2Door]),
        new Room("Room 3", [[50,250],[250,250],[250,350],[50,350]], [room3Door]),
        new Room("Corridor", [[250,50],[350,50],[350,350],[250,350]], [corridorDoor]),
        new Room("Restaurant", [[350,50],[650,50],[650,250],[350,250]], [restaurantDoorA, restaurantDoorB]),
        new Room("Lobby", [[350,250],[650,250],[650,550],[350,550]], [lobbyDoorA, lobbyDoorB]),
        new Room("Gym", [[50,350],[350,350],[350,550],[50,550]], [gymDoor]),
        new Room("Swimming Pool Area", [[1000,100],[1250,100],[1250,500],[1000,500]], null),
        new Room("Ballroom", [[650,250],[900,250],[900,550],[650,550]], [ballroomDoor, ballroomDoorOut]),
        new Room("Bar", [[650,50],[900,50],[900,250],[650,250]], [barDoorBall,barDoorOut,barDoorResturant])
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
                    rooms[i].doors[j].doorLocked = await fetchApi(`isDoorLocked?doorName=${rooms[i].doors[j].doorName}`);
                    console.log(rooms[i].doors[j].doorName+" locked = "+rooms[i].doors[j].doorLocked);
                }
            }

        }


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
            loadRooms();
            setAllRoomData();
            refreshCanvas();
        }, SECOND);

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
        >
        </canvas>
        </>
    );
}
 
export default RoomCanvas;
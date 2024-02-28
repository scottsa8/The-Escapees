import { useEffect, useRef } from "react";

const RoomCanvas = () => {

    const CANVAS_WIDTH = 500
    const CANVAS_HEIGHT = 600

    const canvasRef = useRef(null);
    const contextRef = useRef(null);

    //creating static objects for now
    const officeObj = {
        name: "Office", 
        coords: [[30,20],[150,20],[150,140],[30,140]],//points to draw to in order
        centerPoint:[90,80],
        upperBound_x: 150,
        lowerBound_x: 30,
        upperBound_y: 140,
        lowerBound_y: 20
    };

    const kitchenObj = {
        name: "Kitchen", 
        coords: [[220,20],[380,20],[380,140],[220,140]], 
        centerPoint:[300,80], 
        upperBound_x: 380,
        lowerBound_x: 220,
        upperBound_y: 140,
        lowerBound_y: 20
    };

    const rooms = [officeObj, kitchenObj];

    function drawRoom(room, fillColour, borderColour){

        //setting up the colours
        contextRef.current.fillStyle = fillColour;
        contextRef.strokeStyle = borderColour;
        
        contextRef.current.beginPath();

        //move to starting coord
        contextRef.current.moveTo(room.coords[0][0], room.coords[0][1]);

        for(let i=0; i<room.coords.length; i++){

            if(i+1 < room.coords.length){
                //draw to next coordinate
                contextRef.current.lineTo(room.coords[i+1][0],room.coords[i+1][1]);
            }else{
                //draw back to the first coordinate to complete polygon
                contextRef.current.lineTo(room.coords[0][0], room.coords[0][1]);
            }
        }

        //draw the shape
        contextRef.current.closePath();
        contextRef.current.fill();
        contextRef.current.stroke();   
        
        //drawing text
        contextRef.current.fillStyle = "Black";
        contextRef.current.font = "30px Arial";
        contextRef.current.textAlign = "center";
        contextRef.current.fillText(room.name, room.centerPoint[0], room.centerPoint[1])

    }

    //draw every room to the canvas
    const drawRooms = () =>{

        for(let j=0; j<rooms.length; j++){
            drawRoom(rooms[j],"#D8E0E6","black")
        }

    }

    const handleClick = (event) => {

        //gets coordinates of where the client has clicked on the canvas
        const userX = event.clientX - event.target.offsetLeft;
        const userY = event.clientY - event.target.offsetTop;
        
        let roomFound = undefined;

        //for a room with 4 sides
        for(let i=0; i<rooms.length; i++){

            //check if the user has clicked within the bounds of one of the drawn rooms
            if((rooms[i].coords.length == 4) && (roomFound == undefined)){
                if((userX > rooms[i].lowerBound_x && userX < rooms[i].upperBound_x) && (userY > rooms[i].lowerBound_y && userY < rooms[i].upperBound_y)){
                    roomFound = rooms[i];
                    break;
                }  
            }
        }

        //if a room has been clicked, change its colour
        if(roomFound != undefined){
            console.log("Clicked "+roomFound.name);
            drawRoom(roomFound, "#EABBBB", "black");
        }

    }

    useEffect(() => {
        console.log("Generating canvas");

        const canvas = canvasRef.current;//finds canvas element
        const context = canvas.getContext("2d");//the drawing object
        contextRef.current = context;

        drawRooms();
    },[])

    return ( 
        <canvas
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            ref={canvasRef}
            onClick={handleClick}
        />
     );
}
 
export default RoomCanvas;
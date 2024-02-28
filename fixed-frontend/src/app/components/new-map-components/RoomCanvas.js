import { useEffect, useRef } from "react";

const RoomCanvas = () => {

    const CANVAS_WIDTH = 500
    const CANVAS_HEIGHT = 600

    const canvasRef = useRef(null);
    const contextRef = useRef(null);

    class Room {

        //sets the bounds used to detect a user click
        #setBounds(coordinates){
            //search through coordinates and find smallest and largest x and y vals
            for(let i=0; i<coordinates.length; i++){

                if(coordinates[i][0] < minX){
                    this.lowerBound_x = coordinates[i][0];
                }
                if(coordinates[i][0] > maxX){
                    this.upperBound_x = coordinates[i][0];
                }
                if(coordinates[i][1] < minY){
                    this.lowerBound_y = coordinates[i][1];
                }
                if(coordinates[i][1] > maxY){
                    this.upperBound_y = coordinates[i][1];
                }
            }
        }

        //finds the center point between bounds
        #setCenterPoint(){
            this.centerPoint[0] = ((this.upperBound_x - this.lowerBound_x)/2) + this.lowerBound_x;
            this.centerPoint[1] = ((this.upperBound_y - this.lowerBound_y)/2) + this.lowerBound_y;
        }

        constructor(name, coordinates){
            this.name = name;
            this.coords = coordinates;
            this.centerPoint = [];

            this.#setBounds(coordinates);
            this.#setCenterPoint()
        }
    }

    const rooms = [
        new Room("Office", [[30,20],[150,20],[150,140],[30,140]]), 
        new Room("Kitchen", [[220,20],[380,20],[380,140],[220,140]])
    ];

    function drawRoom(room, fillColour, borderColour){

        //defining colours used
        contextRef.current.fillStyle = fillColour;
        contextRef.current.strokeStyle = borderColour;

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
        contextRef.current.fillStyle = "black";
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

    //clears and redraws the rooms
    function refreshCanvas(){
        contextRef.current.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        drawRooms();
    }

    const handleClick = (event) => {

        //gets coordinates of where the client has clicked on the canvas
        const userX = event.clientX - event.target.offsetLeft;
        const userY = event.clientY - event.target.offsetTop;
        
        let roomFound = undefined;

        refreshCanvas();//reset any existing colours

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
            drawRoom(roomFound, "#EABBBB", "Black");
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
import { useEffect, useRef } from "react";

const RoomCanvas = () => {

    const CANVAS_WIDTH = 500
    const CANVAS_HEIGHT = 600

    const canvasRef = useRef(null);
    const contextRef = useRef(null);

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
            this.closed = true;
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
        }
    }

    class Room {
        //sets the bounds used to detect a user click
        #setBounds(coordinates){
            //search through coordinates and find smallest and largest x and y vals

            let minX = coordinates[0][0];
            let minY = coordinates[0][1];
            let maxX = coordinates[0][0];
            let maxY = coordinates[0][1];;

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

        #drawDoors(fillColour, borderColour){
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

            //draw the doors
            this.#drawDoors(fillColour, borderColour);

            //drawing text
            contextRef.current.fillStyle = "black";
            contextRef.current.font = "30px Arial";
            contextRef.current.textAlign = "center";
            contextRef.current.fillText(this.name, this.centerPoint[0], this.centerPoint[1])
        }

    }

    const doorA = new Door("Office Main", [150, 50]);

    const rooms = [
        new Room("Office", [[30,20],[150,20],[150,140],[30,140]],[doorA]), 
        new Room("Kitchen", [[220,20],[380,20],[380,140],[220,140]],null)
    ];

    //draw every room to the canvas
    const drawRooms = () =>{
        for(let j=0; j<rooms.length; j++){
            rooms[j].draw("#D8E0E6","black")
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
            roomFound = rooms[i].checkClick(userX, userY);
            if(roomFound){
                break;
            }
        }
        //if a room has been clicked, change its colour
        if(roomFound != undefined){
            console.log("Clicked "+roomFound.name);
            roomFound.draw("#EABBBB", "Black");
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
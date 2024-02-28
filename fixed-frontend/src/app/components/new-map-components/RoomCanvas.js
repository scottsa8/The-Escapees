import { useEffect, useRef } from "react";

const RoomCanvas = () => {
    const CANVAS_WIDTH = 500
    const CANVAS_HEIGHT = 600

    const canvasRef = useRef(null);
    const contextRef = useRef(null);

    //coordinates for rooms (in order around)
    const officeCoords = [[30,20],[150,20],[150,140],[30,140]];
    const kitchenCoords = [[220,20],[380,20],[380,140],[220,140]];
    const communalAreaCoords = [[],[],[],[]];
    const holdingCellCoords = [[],[],[],[]];

    const rooms = [officeCoords, kitchenCoords, communalAreaCoords, holdingCellCoords];

    const drawRooms = () =>{

        contextRef.current.fillStyle = "#D8E0E6";//light grey

        for(let j=0; j<rooms.length; j++){
            contextRef.current.beginPath();

            //move to starting coord
            contextRef.current.moveTo(rooms[j][0][0], rooms[j][0][1]);

            for(let i=0; i<rooms[j].length; i++){
                
                if(i+1 < rooms[0].length){
                    //draw to next coordinate
                    contextRef.current.lineTo(rooms[j][i+1][0],rooms[j][i+1][1]);
                }else{
                    //draw back to the first coordinate to complete polygon
                    contextRef.current.lineTo(rooms[j][0][0], rooms[j][0][1]);
                }
            
        }
        //draw the shape
        contextRef.current.closePath();
        contextRef.current.fill();
        contextRef.current.stroke();    
        }

    }

    const handleClick = (event) => {

        //gets coordinates of where the client has clicked on the canvas
        const userX = event.clientX - event.target.offsetLeft;
        const userY = event.clientY - event.target.offsetTop;
        
        let roomFound = false;

        //for a room with 4 sides
        for(let i=0; i<rooms.length; i++){
            let lowXBound = rooms[i][0][0]
            let upXBound = rooms[i][1][0]
            let lowYBound = rooms[i][1][1]
            let upYBound = rooms[i][2][1]

            //check if the user has clicked within the bounds of one of the drawn rooms
            if((rooms[i].length == 4) && (roomFound == false)){
                if((userX > lowXBound && userX < upXBound) && (userY > lowYBound && userY < upYBound)){
                    roomFound = true;
                    break;
                }  
            }
        }

        if(roomFound){
            console.log("In room");
        }else{
            console.log("Out room");
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

        ></canvas>
     );
}
 
export default RoomCanvas;
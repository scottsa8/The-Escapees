import { useEffect, useRef } from "react";

const RoomCanvas = () => {

    const canvasRef = useRef(null);
    const contextRef = useRef(null);

    const officeCoords = [[20,20],[140,20],[140,140],[20,140]];
    const kitchenCoords = [[],[],[],[]];
    const communalAreaCoords = [[],[],[],[]];
    const holdingCellCoords = [[],[],[],[]];

    const rooms = [officeCoords, kitchenCoords, communalAreaCoords, holdingCellCoords];

    const drawRooms = () =>{
        //for all TODO

        //just to test, draw office
        contextRef.current.fillStyle = "#D8E0E6";
        contextRef.current.beginPath();

        //starting coord
        contextRef.current.moveTo(rooms[0][0][0], rooms[0][0][1]);
        for(let i=0; i<rooms[0].length; i++){
            
            if(i+1 < rooms[0].length){
                //draw to next coordinate
                contextRef.current.lineTo(rooms[0][i+1][0],rooms[0][i+1][1]);
            }else{
                //draw back to the first coordinate to complete polygon
                contextRef.current.lineTo(rooms[0][0][0], rooms[0][0][1]);
            }
            
        }
        contextRef.current.closePath();
        contextRef.current.fill();

        contextRef.current.stroke();

    }

    useEffect(() => {
        console.log("Generating canvas");

        const canvas = canvasRef.current;//finds canvas element
        const context = canvas.getContext("2d");//the drawing object

        //fill with colour
        //context.fillStyle = "#D8E0E6";
        // context.fillRect(0,0,200,100);
        // context.moveTo(0,0);
        // context.lineTo(200,100);
        // context.stroke();

        contextRef.current = context;
        drawRooms();
    },[])

    return ( 
        <canvas
        ref={canvasRef}

        ></canvas>
     );
}
 
export default RoomCanvas;
class Door{

    static ICON_SIZE = this.ICON_SIZE;
    static closedLockIcon = new Image();
    static openLockIcon = new Image();

    static contextRef;

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
        Door.contextRef.current.fillStyle = fillColour;
        Door.contextRef.current.strokeStyle = borderColour;

        Door.contextRef.current.beginPath();

        //move to starting coord
        Door.contextRef.current.moveTo(this.coords[0][0], this.coords[0][1]);

        for(let i=0; i<this.coords.length; i++){

            if(i+1 < this.coords.length){
                //draw to next coordinate
                Door.contextRef.current.lineTo(this.coords[i+1][0],this.coords[i+1][1]);
            }else{
                //draw back to the first coordinate to complete polygon
                Door.contextRef.current.lineTo(this.coords[0][0], this.coords[0][1]);
            }
        }

        //draw the shape
        Door.contextRef.current.closePath();
        Door.contextRef.current.fill();
        Door.contextRef.current.stroke();

        if(this.doorLocked == true){
            console.log("Drawing door lock");
            Door.contextRef.current.drawImage(Door.closedLockIcon, this.location[0]-Door.ICON_SIZE/2, this.location[1]-Door.ICON_SIZE/2, Door.ICON_SIZE, Door.ICON_SIZE);
        }else{
            Door.contextRef.current.drawImage(Door.openLockIcon, this.location[0]-Door.ICON_SIZE/2, this.location[1]-Door.ICON_SIZE/2, Door.ICON_SIZE, Door.ICON_SIZE);
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

export default Door;
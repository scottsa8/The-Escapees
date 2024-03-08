/**
 * A class representing a door to draw to a canvas
 */
class Door{

    static closedLockIcon = new Image();
    static openLockIcon = new Image();

    static contextRef;
    static ICON_SIZE;

    /**
     * Sets the coordinates for the corners of the door
     * @param {*} size The size of the door to draw
     * @param {*} location Where the center of the door is to be placed
     */ 
    #setCoords(size, location){
        size = size/2;
        let x = location[0];
        let y = location[1];

        this.coords = [[x-size,y-size],[x+size, y-size],[x+size, y+size],[x-size, y+size]];
    }

    constructor(name, location){
        this.doorName = name;
        this.location = location;//the center point for the box representing the door
        this.size = 20;//20pixels in height and width
        this.#setCoords(this.size, location);
        this.doorLocked = true;
        Door.ICON_SIZE = this.size - 5;
    }

    /**
     * Draws the lock icon inside the door
     */
    #drawIcon(){

        if(this.doorLocked == true){
            //show a closed padlock icon
            Door.contextRef.current.drawImage(Door.closedLockIcon, this.location[0]-Door.ICON_SIZE/2, this.location[1]-Door.ICON_SIZE/2, Door.ICON_SIZE, Door.ICON_SIZE);
        }else{
            //show an open padlocak icon
            Door.contextRef.current.drawImage(Door.openLockIcon, this.location[0]-Door.ICON_SIZE/2, this.location[1]-Door.ICON_SIZE/2, Door.ICON_SIZE, Door.ICON_SIZE);
        }
    }

    /**
     * Draws the door to a canvas
     * @param {*} fillColour The background colour
     * @param {*} borderColour The outer colour
     */
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


        this.#drawIcon();
    }
}

export default Door;
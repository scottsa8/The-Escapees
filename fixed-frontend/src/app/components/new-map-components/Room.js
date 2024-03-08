/**
 * A class representing a room to draw to a canvas
 */
class Room {

    //default maximum room values
    static maxValues = {
        maxTemp: 100,
        maxLight: 100,
        maxNoise: 100
    };

    static userIcon = new Image();
    static tempIcon = new Image();
    static lightIcon = new Image();
    static noiseIcon = new Image();

    static ICON_SIZE;

    static contextRef;

    /**
     * Sets the bounds used to detect if a user has clicked the room
     * @param {*} coordinates The corners of the room
     */
    #setBounds(coordinates){
        //search through coordinates and find smallest and largest x and y vals

        let minX = coordinates[0][0];
        let minY = coordinates[0][1];
        let maxX = coordinates[0][0];
        let maxY = coordinates[0][1];

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
    /**
     * Finds the center point between bounds
     */
    #setCenterPoint(){
        this.centerPoint[0] = ((this.upperBound_x - this.lowerBound_x)/2) + this.lowerBound_x;
        this.centerPoint[1] = ((this.upperBound_y - this.lowerBound_y)/2) + this.lowerBound_y;
    }

    constructor(name, coordinates,doors){
        this.name = name;       
        this.coords = coordinates;
        this.centerPoint = [];
        this.doors = doors;
        this.temp = 0;
        this.noise = 0;
        this.light = 0;
        this.user = false;//if the current user is in the room or not
        this.toShow = [];//environmental icons to show

        this.#setBounds(coordinates);
        this.#setCenterPoint()
    }

   /**
    * Fetches the current room if it has been clicked
    * @param {*} x X coordinate clicked
    * @param {*} y Y coordinae clicked
    * @returns the room object that has been selected
    */
    checkClick(x, y){
        let roomFound = undefined;
        if(this.coords != undefined && this.coords != null){
            if((this.coords.length == 4) && (roomFound == undefined)){
                //if it is within the bounds
                if((x > this.lowerBound_x && x < this.upperBound_x) && (y > this.lowerBound_y && y < this.upperBound_y)){
                    roomFound = this;
                }  
            }
        }        
        return roomFound;
    }

    /**
     * Draws the doors for the current rooms
     * @param {*} fillColour The background colour
     * @param {*} borderColour The colour around the edge of the room
     * @returns void
     */
    drawDoors(fillColour, borderColour){
        if(this.doors == null){
            return;
        }
        for(let i=0; i<this.doors.length; i++){
            this.doors[i].draw(fillColour, borderColour);
        }
    }

    /**
     * Draws the current room and any icons that need to be shown
     * @param {*} fillColour The background colour
     * @param {*} borderColour The colour around he edge of the room
     */
    draw(fillColour, borderColour){
        //defining colours used
        Room.contextRef.current.fillStyle = fillColour;
        Room.contextRef.current.strokeStyle = borderColour;

        Room.contextRef.current.beginPath();

        //move to starting coord
        Room.contextRef.current.moveTo(this.coords[0][0], this.coords[0][1]);

        for(let i=0; i<this.coords.length; i++){

            if(i+1 < this.coords.length){
                //draw to next coordinate
                Room.contextRef.current.lineTo(this.coords[i+1][0],this.coords[i+1][1]);
            }else{
                //draw back to the first coordinate to complete polygon
                Room.contextRef.current.lineTo(this.coords[0][0], this.coords[0][1]);
            }
        }

        //draw the shape
        Room.contextRef.current.closePath();
        Room.contextRef.current.fill();
        Room.contextRef.current.stroke();   

        //drawing text
        Room.contextRef.current.fillStyle = "black";
        Room.contextRef.current.font = "20px Arial";
        Room.contextRef.current.textAlign = "center";
        Room.contextRef.current.fillText(this.name, this.centerPoint[0], this.lowerBound_y + 40);

        //if there is a user in the room, draw it
        if(this.user == true){
            Room.contextRef.current.drawImage(Room.userIcon, this.centerPoint[0]-Room.ICON_SIZE/2, this.centerPoint[1]-Room.ICON_SIZE, Room.ICON_SIZE, Room.ICON_SIZE);
            console.log("Drawing user");
        }

        //Display any additional icons
        if(this.toShow.length > 0){

            //Arrange environmental icons dependent on how many there are
            let startPoint;
            switch(this.toShow.length){
                case 1:
                    startPoint = [(this.centerPoint[0]-(Room.ICON_SIZE/2)),(this.centerPoint[1]+(Room.ICON_SIZE/2))];
                    break;
                case 2:
                    startPoint = [(this.centerPoint[0]-(Room.ICON_SIZE*1.25)),(this.centerPoint[1]+(Room.ICON_SIZE/2))];
                    break;
                case 3:
                    startPoint = [(this.centerPoint[0]-(Room.ICON_SIZE*2)),(this.centerPoint[1]+(Room.ICON_SIZE/2))];
                    break;
                default:
                    startPoint = [(this.centerPoint[0]-(Room.ICON_SIZE/2)),(this.centerPoint[1]+(Room.ICON_SIZE/2))]
                    break;
            }

            for(let i=0; i<this.toShow.length; i++){
                Room.contextRef.current.drawImage(this.toShow[i], startPoint[0], startPoint[1], Room.ICON_SIZE, Room.ICON_SIZE);
                startPoint = [(startPoint[0]+(Room.ICON_SIZE*1.5)),(startPoint[1])];
            }

        }

    }

    /**
     * Sets the current environmental data of the room and checks what icons need to be displayed
     * @param {*} temp The temperature of the current room
     * @param {*} noise The noise level in the current room
     * @param {*} light The light level in the current room
     */
    setAndCheckEnvironmentalData(temp, noise, light){

        this.temp = parseFloat(temp);
        this.noise = parseFloat(noise);
        this.light = parseFloat(light);
        
        this.toShow = [];//to test, empty on run

        if(this.temp > Room.maxValues.temp){
            this.toShow.push(Room.tempIcon);
        }
        if(this.light > Room.maxValues.light){
            this.toShow.push(Room.lightIcon)
        }
        if(this.noise > Room.maxValues.noise){
            this.toShow.push(Room.noiseIcon)
        }

    }

    /**
     * Sets the room colour to red to indicate that there is a problem in that room
     */
    alarm(){
        this.draw("#EABBBB", "Black");
        this.drawDoors("#D8E0E6","black");
    }

}

export default Room;
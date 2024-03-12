const { describe } = require("node:test");
import Door from "./Door"

//tests for any functions used to create a Door class
describe("Door setup", ()=>{
    test("Constructor Values set",()=>{

        let doorName = "door";
        let doorLocation = [0,0];
        const doorInstance = new Door(doorName, doorLocation);

        //parameter set values
        expect(doorInstance.doorName).toBe(doorName);
        expect(doorInstance.location).toBe(doorLocation);

        //default door settings on load
        expect(doorInstance.doorLocked).toBe(true);
        expect(doorInstance.size).toBe(20);

    });
    //if the coordinates to draw the door are set correctly
    test("Setting Coords", ()=>{
        const doorInstance = new Door("door", [10,10]);

        let size = doorInstance.size/2;

        let topLeft = [10-size, 10-size];
        let topRight = [10 + size, 10-size];
        let bottomRight =[10+size, 10+size];
        let bottomLeft =[10-size, 10+size];

        expect(doorInstance.coords).toEqual([topLeft, topRight, bottomRight, bottomLeft]);
    });
});
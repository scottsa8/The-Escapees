const { describe } = require("node:test");
// const Room = require("./Room");
import Room from "./Room"
import Door from "./Door"

//tests on setting the boundries for a room
describe("Room boundries", () => {
    test("Upper bound X set correctly", () =>{
        const roomInstance = new Room("new room", [[1,1],[2,1],[2,2],[1,2]], null);
        expect(roomInstance.upperBound_x).toBe(2);
    });
    test("Upper bound Y set correctly", () =>{
        const roomInstance = new Room("new room", [[1,1],[2,1],[2,2],[1,2]], null);
        expect(roomInstance.upperBound_y).toBe(2);
    });
    test("Lower bound X set correctly", () =>{
        const roomInstance = new Room("new room", [[1,1],[2,1],[2,2],[1,2]], null);
        expect(roomInstance.lowerBound_x).toBe(1);
    });
    test("Lower bound Y set correctly", () =>{
        const roomInstance = new Room("new room", [[1,1],[2,1],[2,2],[1,2]], null);
        expect(roomInstance.lowerBound_y).toBe(1);
    });

});

//test on the constructor
describe("Default values", () => {
    test("Name set correctly", () => {
        const roomInstance = new Room("new room", [[1,1],[2,1],[2,2],[1,2]], null);
        expect(roomInstance.name).toBe("new room");
    });
    test("Coordiantes set correctly", () => {
        const array = [[1,1],[2,1],[2,2],[1,2]];
        const roomInstance = new Room("new room", array, null);
        expect(roomInstance.coords).toEqual(array);
    });
    test("When there are no doors for a room", () => {
        const roomInstance = new Room("new room", [[1,1],[2,1],[2,2],[1,2]], null);
        expect(roomInstance.doors).toBe(null);
    });
    test("When a room contains a single door", () => {
        const doorA = new Door("new door", [1,1]);
        const roomInstance = new Room("new room", [[1,1],[2,1],[2,2],[1,2]], [doorA]);
        expect(roomInstance.doors).toContain(doorA);
    });
    test("When a room contains multiple doors", () => {
        const doorArray = [new Door("door A", [1,1]), new Door("door B", [1,2])];
        const roomInstance = new Room("new room", [[1,1],[2,1],[2,2],[1,2]], doorArray);
        expect(roomInstance.doors).toEqual(doorArray);
    });
    test("Initial environmental values are correct", () => {
        const roomInstance = new Room("new room", [[1,1],[2,1],[2,2],[1,2]], null);
        expect(roomInstance.temp).toBe(0);
        expect(roomInstance.light).toBe(0);
        expect(roomInstance.noise).toBe(0);
    });
});

//Bound tests on the checkClick() funtion
describe("Click functionality", ()=>{
    test("Check click: inside bounds", () => {
        const roomInstance = new Room("new room", [[1,1],[3,1],[3,3],[1,3]], null);
        expect(roomInstance.checkClick(2,2)).toBe(roomInstance);
    });
    test("Check click: outside X bounds", () => {
        const roomInstance = new Room("new room", [[1,1],[3,1],[3,3],[1,3]], null);
        expect(roomInstance.checkClick(roomInstance.lowerBound_x-1,2)).toBe(undefined);//below
        expect(roomInstance.checkClick(roomInstance.upperBound_x+1,2)).toBe(undefined);//above
    });
    test("Check click: on X bounds", ()=>{
        const roomInstance = new Room("new room", [[1,1],[3,1],[3,3],[1,3]], null);
        expect(roomInstance.checkClick(roomInstance.lowerBound_x,2)).toBe(undefined);//lower bound
        expect(roomInstance.checkClick(roomInstance.upperBound_x,2)).toBe(undefined);//upper bound
    });
    test("Check click: outside Y bounds", () =>{
        const roomInstance = new Room("new room", [[1,1],[3,1],[3,3],[1,3]], null);
        expect(roomInstance.checkClick(2,roomInstance.lowerBound_y-1)).toBe(undefined);//lower bound
        expect(roomInstance.checkClick(2,roomInstance.upperBound_y+1)).toBe(undefined);//upper bound
    });
    test("Check click: on Y bounds", () => {
        const roomInstance = new Room("new room", [[1,1],[3,1],[3,3],[1,3]], null);
        expect(roomInstance.checkClick(2,roomInstance.lowerBound_y)).toBe(undefined);//lower bound
        expect(roomInstance.checkClick(2,roomInstance.upperBound_y)).toBe(undefined);//upper bound
    });
    test("Check click: corners", () => {
        const roomInstance = new Room("new room", [[1,1],[3,1],[3,3],[1,3]], null);
        for(let i=0; i<roomInstance.coords.length; i++){
            expect(roomInstance.checkClick(roomInstance.coords[i])).toBe(undefined);
        }
    
    });
    test("Check click: array size", () => {
        //it won't check if the array size isn't 4
        const roomInstance = new Room("new room", [[1,1],[3,1],[3,3],[1,3]], null);
        expect(roomInstance.checkClick(2,2)).toBe(roomInstance);//size 4

        roomInstance.coords = [];
        expect(roomInstance.checkClick(2,2)).toBe(undefined);//size 0

        roomInstance.coords = [[0,0]];
        expect(roomInstance.checkClick(2,2)).toBe(undefined);//size 1

        roomInstance.coords = [[1,1],[3,1],[3,3],[2,4],[1,3]];//size 5
        expect(roomInstance.checkClick(2,2)).toBe(undefined);

        roomInstance.coords = undefined;
        expect(roomInstance.checkClick(2,2)).toBe(undefined);//undefined

        roomInstance.coords = null;
        expect(roomInstance.checkClick(2,2)).toBe(undefined);//null
    });
});
//tests for if the correct icons are added to the array, ready to be drawn
describe("Chcking environmental icons", ()=>{
    test("Add icon for temperature", ()=>{
        const roomInstance = new Room("new room", [[1,1],[3,1],[3,3],[1,3]], null);
        Room.maxValues.temp = 30;

        //on boundary
        roomInstance.setAndCheckEnvironmentalData(30,0,0);
        expect(roomInstance.toShow).not.toContain(Room.tempIcon);

        //below threshold
        roomInstance.setAndCheckEnvironmentalData(0,0,0);
        expect(roomInstance.toShow).not.toContain(Room.tempIcon);

        //above threshold
        roomInstance.setAndCheckEnvironmentalData(31,0,0);
        expect(roomInstance.toShow).toContain(Room.tempIcon);

    });
    test("Add icon for light level", ()=>{
        const roomInstance = new Room("new room", [[1,1],[3,1],[3,3],[1,3]], null);
        Room.maxValues.light = 30;

        //on boundary
        roomInstance.setAndCheckEnvironmentalData(0,0,30);
        expect(roomInstance.toShow).not.toContain(Room.lightIcon);

        //below threshold
        roomInstance.setAndCheckEnvironmentalData(0,0,0);
        expect(roomInstance.toShow).not.toContain(Room.lightIcon);

        //above threshold
        roomInstance.setAndCheckEnvironmentalData(0,0,31);
        expect(roomInstance.toShow).toContain(Room.lightIcon);

    });
    test("Add icon for noise level", ()=>{
        const roomInstance = new Room("new room", [[1,1],[3,1],[3,3],[1,3]], null);
        Room.maxValues.noise = 30;

        //on boundary
        roomInstance.setAndCheckEnvironmentalData(0,30,0);
        expect(roomInstance.toShow).not.toContain(Room.noiseIcon);

        //below threshold
        roomInstance.setAndCheckEnvironmentalData(0,0,0);
        expect(roomInstance.toShow).not.toContain(Room.noiseIcon);

        //above threshold
        roomInstance.setAndCheckEnvironmentalData(0,31,0);
        expect(roomInstance.toShow).toContain(Room.noiseIcon);

    });
    test("Icons for two environmental notifications added", () =>{
        const roomInstance = new Room("new room", [[1,1],[3,1],[3,3],[1,3]], null);
        Room.maxValues.noise = 30;
        Room.maxValues.light = 30;
        Room.maxValues.temp = 30;

        //Temperature and Noise
        roomInstance.setAndCheckEnvironmentalData(31,31,0);
        expect(roomInstance.toShow).toEqual([Room.tempIcon, Room.noiseIcon]);

        //Temperature and Light
        roomInstance.setAndCheckEnvironmentalData(31,0,31);
        expect(roomInstance.toShow).toEqual([Room.tempIcon, Room.lightIcon]);

        //Noise and Light
        roomInstance.setAndCheckEnvironmentalData(0,31,31);
        expect(roomInstance.toShow).toEqual([Room.noiseIcon,Room.lightIcon]);
    });
    test("All icons for environmental notifications added", () =>{
        const roomInstance = new Room("new room", [[1,1],[3,1],[3,3],[1,3]], null);
        Room.maxValues.noise = 30;
        Room.maxValues.light = 30;
        Room.maxValues.temp = 30;

        //All 3 environmental inputs are over the limit
        roomInstance.setAndCheckEnvironmentalData(31,31,31);
        expect(roomInstance.toShow).toEqual([Room.tempIcon, Room.noiseIcon, Room.lightIcon]);

        //None of the environmental inputs are over the limit
        roomInstance.setAndCheckEnvironmentalData(0,0,0);
        expect(roomInstance.toShow).toEqual([]);

    });

})
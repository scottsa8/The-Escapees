import { useEffect, useState } from "react";
import { network } from "../layout";
import RoomCard from "./RoomCard";

export default function LocationCountBox({onRoomClick}){
    const [locations, setLocations] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState("Room1");

    useEffect(() => {
      fetch(`http://${network.ip}:${network.port}/getRooms`,
      {mode: 'cors',headers: {'Access-Control-Allow-Origin':'*'}})
        .then(response => response.json())
        .then(data => {
          const roomNames = data.rooms.data
          .map(roomObj => roomObj.room)
          .filter(roomName => !roomName.includes('gate'));
          setLocations(roomNames);
        });
    }, []);

    return(
      <div className="w-full pl-4 min-w-0 flex flex-wrap justify-start space-between">
          {locations.map(room => (
          <RoomCard key={room} roomName={room} onClick={() => {setSelectedRoom(room); onRoomClick(room);}} isSelected={selectedRoom === room}/>
          ))}
      </div>
    )
}
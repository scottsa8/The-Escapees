import { useEffect, useState } from "react";
import { network } from "../layout";

function RoomCard({ roomName, onClick, isSelected}) {
    const [inmateCount,setInmateCount] = useState(0)
    const [guardCount,setGuardCount] = useState(0)

    useEffect(() => {
      fetch(`http://${network.ip}:${network.port}/getPeople?loc=${roomName}$type=inmate`)
        .then(response => response.json())
        .then(num => setInmateCount(num));
      fetch(`http://${network.ip}:${network.port}/getPeople?loc=${roomName}$type=guard`)
        .then(response => response.json())
        .then(num => setGuardCount(num));
      }, []);

    const cardStyle = isSelected ? { backgroundColor: '#1B2030', cursor: 'pointer' } : { cursor: 'pointer' };

    return (
      <div onClick={onClick} style={cardStyle} className="bg-white shadow-md rounded-lg p-4 m-4 max-w-sm w-60 dark:bg-gray-700 dark:text-blue-100">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-blue-300">{`${roomName}`}</h2>
        <p className="text-gray-600 mt-2 dark:text-blue-100">{`Prisoners: ${inmateCount}`}</p>
        <p className="text-gray-600 mt-2 dark:text-blue-100">{`Guards: ${guardCount}`}</p>
      </div>
    );
} 

export default function LocationCountBox({onRoomClick}){
    const [locations, setLocations] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState("Room1");

    useEffect(() => {
      fetch(`http://${network.ip}:${network.port}/getRooms`)
        .then(response => response.json())
        .then(data => {
          const roomNames = data.rooms.data
          .map(roomObj => roomObj.room)
          .filter(roomName => !roomName.includes('gate'));
          setLocations(roomNames);
        });
    }, []);

    return(
      <div className="w-full min-w-0 flex flex-wrap justify-start space-between">
          {locations.map(room => (
          <RoomCard roomName={room} onClick={() => {setSelectedRoom(room); onRoomClick(room);}} isSelected={selectedRoom === room}/>
          ))}
      </div>
    )
}
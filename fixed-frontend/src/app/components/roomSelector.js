import {useEffect, useState} from 'react';
import {network} from '../layout';

export default function RoomSelector({onLocationChange}){
  const [locations, setLocations] = useState(["","Kitchen", "Cell"]);
  const [selectedRoom, setSelectedRoom] = useState("");


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

  const handleRoomChange = (e) => {
    setSelectedRoom(e.target.value);
    onLocationChange(e.target.value);
  };

  return (
  <div className="roomSelector">
    <select value={selectedRoom} onChange={handleRoomChange} className="p-2 border rounded-md shadow-md">
      {locations.map((location, index) => (
        <option key={index} value={location}>{location}</option>
      ))}
    </select>
  </div>
  );
}
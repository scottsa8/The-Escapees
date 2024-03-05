import React from 'react';
import {useEffect, useState} from 'react';
import {network} from '../layout';
import { useQuery } from 'react-query';
import { fetchApi } from './apiFetcher';

export default function RoomSelector({onLocationChange}){
  const [locations, setLocations] = useState(["","Kitchen", "Cell"]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const { data, error, refetch } = useQuery('roomNames', () => fetchApi('getRooms'));

  const handleRoomChange = (e) => {
    setSelectedRoom(e.target.value);
    onLocationChange(e.target.value);
  };

  useEffect(() => { 
    if (error || !data) {
      console.error(error);
      return;
    }
    const roomNames = data.rooms.data
      .map(roomObj => roomObj.room)
      .filter(roomName => roomName && !roomName.includes('gate'));
    setLocations(roomNames);
  }, [data, error, refetch]);


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
import { useEffect, useState } from "react";
import { network } from "../layout";
import RoomCard from "./RoomCard";
import { useQuery } from 'react-query';
import { fetchApi } from './apiFetcher';

export default function LocationCountBox({onRoomClick}){
    const [selectedRoom, setSelectedRoom] = useState("Room1");

    const { data: locations, isError, isLoading } = useQuery('locations', async () => {
      const data = await fetchApi('getRooms');
      const roomNames = data.rooms.data
        .map(roomObj => roomObj.room)
        .filter(roomName => !roomName.includes('gate'));
      return roomNames;
    });

    if (isLoading) {
      return <div>Loading...</div>;
    }

    return(
      <div className="w-full pl-4 min-w-0 flex flex-wrap justify-start space-between">
          {locations.map(room => (
          <RoomCard key={room} roomName={room} onClick={() => {setSelectedRoom(room); onRoomClick(room);}} isSelected={selectedRoom === room}/>
          ))}
      </div>
    )
}
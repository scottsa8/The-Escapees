import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@material-ui/core';
import {fetchApi} from './apiFetcher';
import {useQuery} from 'react-query';
import { useState } from 'react';

export default function MicroManager() {
    const { data: roomData, isLoading: isRoomLoading, isError: isRoomError, refetch: refetchRoom } = useQuery('getRoomInfo', () => fetchApi("getRoomInfo"));  
    const { data: namesData, isLoading: isNamesLoading, isError: isNamesError, refetch: refetchNames } = useQuery('getAllNames', () => fetchApi("getAllNames"));  
    const [type, setType] = useState('');
    const [name, setName] = useState('');
    const [microbit, setMicrobit] = useState('');
    const [overwrite, setOverwrite] = useState('');
    const [roomName, setRoomName] = useState('');
    const [mbName, setMbName] = useState('');
    const [maxValues, setMaxValues] = useState('');

    const handleAddRoom = async () => {
        await fetchApi(`addNode?roomName=${roomName}&mb=${mbName}&maxes=${maxValues}`);
        refetchRoom();
      };
    
      const handleUpdateMax = async () => {
        await fetchApi(`updateMax?roomName=${roomName}&max=${maxValues}`);
        refetchRoom();
      };
    
      const handleUpdateMB = async () => {
        await fetchApi(`updateMB?type=${type}&name=${name}&microbit=${microbit}&overwrite=${overwrite}`);
        refetchNames();
        refetchRoom();
      };

      if (isRoomLoading || isNamesLoading) {
        return <div>Loading...</div>;
      }
    
      if (isRoomError || isNamesError) {
        return <div>Error fetching data</div>;
      }

    return (
        <div className="microbit-container flex justify-between flex-no-wrap">
        <div className="space-y-4">
            <div className="space-y-2">
                <h2 className="text-lg font-bold text-blue-700 dark:text-blue-100">Add Room</h2>
                <input className="block w-full p-2 border rounded" value={roomName} onChange={e => setRoomName(e.target.value)} placeholder="Room Name" />
                <input className="block w-full p-2 border rounded" value={mbName} onChange={e => setMbName(e.target.value)} placeholder="Microbit Name" />
                <input className="block w-full p-2 border rounded" value={maxValues} onChange={e => setMaxValues(e.target.value)} placeholder="Max Values" />
                <button className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600" onClick={handleAddRoom}>Add Room</button>
            </div>

            <div className="space-y-2">
                <h2 className="text-lg font-bold text-blue-700 dark:text-blue-100">Update Max Values</h2>
                <input className="block w-full p-2 border rounded" value={roomName} onChange={e => setRoomName(e.target.value)} placeholder="Room Name" />
                <input className="block w-full p-2 border rounded" value={maxValues} onChange={e => setMaxValues(e.target.value)} placeholder="Max Values" />
                <button className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600" onClick={handleUpdateMax}>Update Max Values</button>
            </div>

            <div className="space-y-2">
                <h2 className="text-lg font-bold text-blue-700 dark:text-blue-100">Update Microbit</h2>
                <input className="block w-full p-2 border rounded" value={type} onChange={e => setType(e.target.value)} placeholder="Type" />
                <input className="block w-full p-2 border rounded" value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
                <input className="block w-full p-2 border rounded" value={microbit} onChange={e => setMicrobit(e.target.value)} placeholder="Microbit Name" />
                <input className="block w-full p-2 border rounded" value={overwrite} onChange={e => setOverwrite(e.target.value)} placeholder="Overwrite" />
                <button className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600" onClick={handleUpdateMB}>Update Microbit</button>
            </div>
            <div className="space-y-2">
                <h2 className="text-lg font-bold text-blue-700 dark:text-blue-100"></h2>
                <input className="block w-full p-2 border rounded" value={type} onChange={e => setType(e.target.value)} placeholder="Type" />
                <input className="block w-full p-2 border rounded" value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
                <input className="block w-full p-2 border rounded" value={microbit} onChange={e => setMicrobit(e.target.value)} placeholder="Microbit Name" />
                <input className="block w-full p-2 border rounded" value={overwrite} onChange={e => setOverwrite(e.target.value)} placeholder="Overwrite" />
                <button className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600" onClick={handleUpdateMB}>Update Microbit</button>
            </div>
        </div>
        <div className="w-1/2 m-2">
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Room</TableCell>
                            <TableCell>Microbit</TableCell>
                            <TableCell>Max Temperature</TableCell>
                            <TableCell>Max Noise</TableCell>
                            <TableCell>Max Light</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {roomData.rooms.data.map((item) => (
                            <TableRow key={item.name}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.microbit}</TableCell>
                                <TableCell>{item.maxTemp}</TableCell>
                                <TableCell>{item.maxNoise}</TableCell>
                                <TableCell>{item.maxLight}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
        <div className="w-1/2 m-2">
            <TableContainer component={Paper} >
                <Table>
                <TableHead>
                    <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Microbit</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {console.log(namesData.names.data)}
                    {namesData.names.data.map((item, index) => (
                    <TableRow key={index}>
                        <TableCell>{item.username}</TableCell>
                        <TableCell>{item.microbit}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </TableContainer>
        </div>
    </div>
    );
};
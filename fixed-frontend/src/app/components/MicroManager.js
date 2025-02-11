import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@material-ui/core';
import {fetchApi} from './apiFetcher';
import {useQuery} from 'react-query';
import { useState } from 'react';
import { getCookie } from './cookies';

export default function MicroManager() {
    const { data: roomData, isLoading: isRoomLoading, isError: isRoomError, refetch: refetchRoom } = useQuery('getRoomInfo', () => fetchApi("getRoomInfo"));  
    const { data: namesData, isLoading: isNamesLoading, isError: isNamesError, refetch: refetchNames } = useQuery('getAllNames', () => fetchApi("getAllNames"));  
    const [type, setType] = useState('');
    const [name, setName] = useState('');
    const [microbit, setMicrobit] = useState('');
    const [roomName, setRoomName] = useState('');
    const [mbName, setMbName] = useState('');
    const [maxValues, setMaxValues] = useState('');
    const [updateMaxValues, setUpdateMaxValues] = useState('');
    const [updateRoomName, updatesetRoomName] = useState('');
    const [selectedOption, setSelectedOption] = useState('initial');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState('');
   
    const handleCreateAccount = async () => {
        await fetchApi(`createAcc?user=${username}&pass=${password}&type=${userType}`);
        refetchNames();
      };
      
    const handleAddRoom = async () => {
        await fetchApi(`addNode?roomName=${roomName}&mb=${mbName}&maxes=${maxValues}`);
        refetchRoom();
      };
    
      const handleUpdateMax = async () => {
        await fetchApi(`updateMax?roomName=${roomName}&max=${maxValues}`);
        refetchRoom();
      };
    
      const handleUpdateMB = async () => {
        await fetchApi(`updateMB?type=${selectedOption}&name=${name}&microbit=${microbit}&overwrite=true`);
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
        getCookie("username") == "Admin"?
            <div className="microbit-container flex justify-between flex-no-wrap">
            <div className="space-y-4">
                <div className="space-y-2">
                    <h2 className="text-lg font-bold text-blue-300 dark:text-blue-100">Add Room</h2>
                    <input className="block w-full p-2 border rounded" value={roomName} onChange={e => setRoomName(e.target.value)} placeholder="Room Name" />
                    <input className="block w-full p-2 border rounded" value={mbName} onChange={e => setMbName(e.target.value)} placeholder="Microbit Name" />
                    <input className="block w-full p-2 border rounded" value={maxValues} onChange={e => setMaxValues(e.target.value)} placeholder="Max Values" />
                    <button className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600" onClick={handleAddRoom}>Add Room</button>
                </div>

                <div className="space-y-2">
                    <h2 className="text-lg font-bold text-blue-300 dark:text-blue-100">Update Max Values</h2>
                    <input className="block w-full p-2 border rounded" value={updateRoomName} onChange={e => updatesetRoomName(e.target.value)} placeholder="Room Name" />
                    <input className="block w-full p-2 border rounded" value={updateMaxValues} onChange={e => setUpdateMaxValues(e.target.value)} placeholder="Max Values" />
                    <button className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600" onClick={handleUpdateMax}>Update Max Values</button>
                </div>

                <div className="space-y-2">
                    
                    <h2 className="text-lg font-bold text-blue-300 dark:text-blue-100">Update Microbit</h2>
                    <select class="flex mb-5 card-container border rounded"  value={selectedOption} onChange={e => setSelectedOption(e.target.value)}>
                    <option value={"initial"}disabled={true}>Select a Type</option>
                    <option value="user">User</option>
                    <option value="room">Room</option>
                    </select>
                    <input className="block w-full p-2 border rounded" value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
                    <input className="block w-full p-2 border rounded" value={microbit} onChange={e => setMicrobit(e.target.value)} placeholder="Microbit Name" />
                    <button className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600" onClick={handleUpdateMB}>Update Microbit</button>
                </div>
                <div className="space-y-2">
                <h2 className="text-lg font-bold text-blue-300 dark:text-blue-100">Create account</h2>
                    <input className="block w-full p-2 border rounded" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username"/>
                    <input className="block w-full p-2 border rounded" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"/>
                    <input className="block w-full p-2 border rounded" type="text" value={userType} onChange={e => setUserType(e.target.value)} placeholder="Type"/>
                    <button className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600" onClick={handleCreateAccount}>Create Account</button>
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
                                    <TableCell>{item.microbit != "null"?item.microbit : ""}</TableCell>
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
                        {namesData.names.data.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell>{item.username}</TableCell>
                            <TableCell>{item.microbit != "null"?item.microbit : ""}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </TableContainer>
            </div>
        </div>
        : (
            <div>
                <h1>SUPER USER ONL!</h1>
            </div>
        )
    );
};
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@material-ui/core';
import {fetchApi} from './apiFetcher';
import {useQuery} from 'react-query';

export default function MicroManager() {
    const { data: roomData, isLoading: isRoomLoading, isError: isRoomError } = useQuery('getRoomInfo', () => fetchApi("getRoomInfo"));  
    const { data: namesData, isLoading: isNamesLoading, isError: isNamesError } = useQuery('getAllNames', () => fetchApi("getAllNames"));  
  
    if (isRoomLoading || isNamesLoading) {
        return <div>Loading...</div>;
      }
    
      if (isRoomError || isNamesError) {
        return <div>Error fetching data</div>;
      }

    return (
        <div className="microbit-container flex justify-between flex-no-wrap">
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
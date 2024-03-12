import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@material-ui/core';
import {fetchApi} from './apiFetcher';
import {useQuery} from 'react-query';

export default function MicroManager() {
    const { data, isLoading, isError, refetch } = useQuery('getRoomInfo', () => fetchApi("getRoomInfo"));  
    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isError) {
        return <div>Error fetching data</div>;
    }

    const testData = [{
                "name": "Cell C",
                "microbit": "null",
                "maxTemp": "30",
                "maxNoise": "30",
                "maxLight": "30"
        },
        {
                "name": "dawda",
                "microbit": "awdaw",
                "maxTemp": "50",
                "maxNoise": "50",
                "maxLight": "50"
        }]

    return (
        <div className="card-container">
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
                        {testData.map((item) => (
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
    );
};
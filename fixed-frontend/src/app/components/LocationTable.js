// TODO: Style popups

import React, { useEffect, useState } from "react";
import { network } from "../layout";
import { Table, Header, HeaderRow, Body, Row, HeaderCell, Cell, } from '@table-library/react-table-library/table';
import { useTheme } from '@table-library/react-table-library/theme';
import { DEFAULT_OPTIONS, getTheme } from '@table-library/react-table-library/mantine';
import { fetchUpdateDelay } from './cookies'
import { get } from "http";

//Table containing the locations of users
const LocationTable = () => { 
  const mantineTheme = getTheme(DEFAULT_OPTIONS);
  const theme = useTheme(mantineTheme);
  const [nodes, setNodes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const removeDuplicates = async (arr) => {
    arr.sort((x, y) => new Date(y.Timestamp) - new Date(x.Timestamp));
    let map = new Map();
    for(let item of arr) {
      if(!map.has(item.name)) {
        map.set(item.name, item);
      }
    }
    return Array.from(map.values());
  }

  const getLocations = async () =>{
    const response = await fetch(`http://${network.ip}:${network.port}/listAll`,
    {mode: 'cors',headers: {'Access-Control-Allow-Origin':'*'}});
    const responseJson = await response.json();
    return responseJson['locations']['data'];
  }
  
  const getCurrentLocations = async () => {
    let newNodes = [];
    let data = await getLocations();
    for(let i=0; i < data.length; i++) {
      let entry = data[i];
      newNodes.push({name:entry['user'],loc:entry['Location'],Timestamp:entry['Timestamp']});
    }
    return await removeDuplicates(newNodes); 
  };

  const getAllLocations = async (user) => {
    let data = await getLocations();
    let userLocations = data.filter(entry => entry['user'] === user);
    return userLocations.map(entry => ({ name: entry['user'], loc: entry['Location'], Timestamp: entry['Timestamp'] }));
  };
    

  useEffect(() => {
    getCurrentLocations().then(newNodes => setNodes(newNodes));
  }, []);

  
  return ( 
    <div className="grow pl-5">
      {/* The table containing location data */}
      <input 
        type="text" 
        placeholder="Search" 
        value={searchTerm} 
        onChange={(event) => setSearchTerm(event.target.value)}
        className="form-input p-4 my-2 border border-gray-300 rounded-md shadow-sm focus:outline-none dark:bg-gray-800 dark:text-gray-100"
      />
      <Table data={{nodes}} theme={theme}>
        {(tableList) => (
          <>
          <Header>
              <HeaderRow>
              <HeaderCell>Name</HeaderCell>
              <HeaderCell>Location</HeaderCell>
              </HeaderRow>
          </Header>

          <Body>
          {tableList
            .filter(item => item.name.includes(searchTerm) || item.loc.includes(searchTerm))
            .map((item) => (
              <Row key={item.name} item={item}>
                <Cell onClick={async () => {
                  let locations = await getAllLocations(item.name);
                  alert(JSON.stringify(locations));}}>
                {item.name}</Cell>
                <Cell>{item.loc}</Cell>
              </Row>
          ))}
          </Body>
          </>
        )}
      </Table>
    </div> 
  );
}
 
export default LocationTable;

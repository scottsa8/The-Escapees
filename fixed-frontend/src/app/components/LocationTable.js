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
  const [showPopup, setShowPopup] = useState(false);
  const [locations, setLocations] = useState([]);
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
  
  /**
   * Retrieves the current locations from the server.
   * wait for promise to resolve before using the data.
   * @returns {Promise<Array<{name: string, loc: string, Timestamp: string}>>}
   */
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
    return userLocations.map(entry => {
      let timestamp = new Date(entry['Timestamp']);
      let timeString = timestamp.toLocaleTimeString();
      return { name: entry['user'], loc: entry['Location'], time: timeString };
    });
  };
    

  useEffect(() => {
    getCurrentLocations().then(newNodes => setNodes(newNodes));
  }, []);

  
  return ( 
    <div className="grow pl-5">
      {/* The table containing location data */}
      <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded relative" role="alert">
              <strong className="font-bold">Senstive data warning</strong>
              <span className="block">Unauthorised access and use of this data is a breach of the
               General Data Protection Regulation and the Computer Missue Act. Failure to comply may result in legal action
              </span>
      </div>
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
              <Row key={item.name} item={item}   onClick={async () => {
                let locations = await getAllLocations(item.name);
                setLocations(locations);
                setShowPopup(true);
              }}>
                <Cell>
                {item.name}</Cell>
                <Cell>{item.loc}</Cell>
              </Row>
          ))}
          </Body>
          </>
        )}
      </Table>
      {showPopup && (
        <div className="absolute bottom-10 rounded-lg shadow-lg left-20 p-4 z-20 bg-sky-500 ">
          <ul>
            {locations.map((location, index) => (
              <li key={index}>
                {location.loc} -- {location.time}
              </li>
            ))}
          </ul>
        {/* <button onClick={() => setShowPopup(false)}>Close</button> */}
      </div>
      )}
    </div> 
  );
}
 
export default LocationTable;

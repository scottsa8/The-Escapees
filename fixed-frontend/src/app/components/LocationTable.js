import React, { useEffect, useState } from "react";
import { network } from "../layout";
import {Table, Header, HeaderRow, Body, Row, HeaderCell, Cell,} from '@table-library/react-table-library/table';
import { useTheme } from '@table-library/react-table-library/theme';
import {DEFAULT_OPTIONS, getTheme} from '@table-library/react-table-library/mantine';
import {fetchUpdateDelay} from './cookies'


const nodes = [];

//Table containing the locations of users

const LocationTable = () => {
  const mantineTheme = getTheme(DEFAULT_OPTIONS);
const theme = useTheme(mantineTheme);
  const [nodes, setNodes] = useState([]);
  const dataTable = {nodes};
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    const getLocations = async () => {
      const response = await fetch(`http://${network.ip}:${network.port}/listAll`,
      {mode: 'cors',headers: {'Access-Control-Allow-Origin':'*'}});
      const data = await response.json();
  
      let data2 = data['locations'];
      let realData = data2['data'];
      let newNodes = [];
      for(let i=0; i < realData.length; i++) {
        let entry = realData[i];
        newNodes.push({name:entry['user'],loc:entry['Location']});
      }
  
      // Remove duplicates
      newNodes = newNodes.filter((node, index, self) =>
        index === self.findIndex((t) => (
          t.name === node.name && t.loc === node.loc
        ))
      );
  
      setNodes(newNodes);
    }
  
    // use update delay from coookies (set on settings page)
    const interval = setInterval(getLocations, fetchUpdateDelay());
  
    return () => clearInterval(interval);
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
      <Table data={dataTable} theme={theme}>
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
                <Cell>{item.name}</Cell>
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

import React, { useEffect, useReducer } from "react";
import { network } from "../layout";

import {Table, Header, HeaderRow, Body, Row, HeaderCell, Cell,} from '@table-library/react-table-library/table';
import { useTheme } from '@table-library/react-table-library/theme';
import {DEFAULT_OPTIONS, getTheme} from '@table-library/react-table-library/mantine';


const mantineTheme = getTheme(DEFAULT_OPTIONS);
const theme = useTheme(mantineTheme);
const nodes = [];

//Table containing the locations of users

const LocationTable = () => {
  const dataTable = {nodes};
  const [, forceUpdate] = useReducer(x => x+1, 0);
  
  useEffect(() => {

    const getLocations = async () => {
      const response = await fetch(`http://${network.ip}:${network.port}/listAll`)
      const data = await response.json();

      let data2 = data['locations'];
      let realData = data2['data'];
      for(let i=0; i < realData.length; i++) {
        let entry = realData[i]
          nodes.push({name:entry['user'],loc:entry['Location']})
          let count=0;
          for(let x=0;x<dataTable.nodes.length;x++){
            if(entry['user']===dataTable.nodes.at(x)['name'] && entry['Location']===dataTable.nodes.at(x)['loc'] && dataTable.nodes.length>1){
              count++;
              if(count>1){
                dataTable.nodes.splice(x,1)
                count=0
              }
            }
          }    
      }
      console.log(nodes)
  }

    //makes sure the data is checked for updates every second
    const interval=setInterval(()=>{
      getLocations()
      forceUpdate();
    },getCookie("updateDelay"))

    return()=>clearInterval(interval)
  });

  
  return ( 
    <div className="grow">
      {/* The table containing location data */}
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
              {tableList.map((item) => (
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

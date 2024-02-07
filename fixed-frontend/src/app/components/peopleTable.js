import React, { useEffect } from "react";
import { network } from "../layout";

import {
    Table,
    Header,
    HeaderRow,
    Body,
    Row,
    HeaderCell,
    Cell,
  } from '@table-library/react-table-library/table';
import { useTheme } from '@table-library/react-table-library/theme';
import {
    DEFAULT_OPTIONS,
    getTheme,
  } from '@table-library/react-table-library/mantine';


const mantineTheme = getTheme(DEFAULT_OPTIONS);
const theme = useTheme(mantineTheme);
 const nodes = [
//    {name: "Adam", loc: "B80"},
//   //   {name: "Scott", loc: "B76"},
//   //   {name: "Hannah", loc: "B70"},
 ];


export default function PeopleTable() {
  const dataTable = {nodes} 
  
  useEffect(() => {
    const getLocations = async () => {
      const response = await fetch(`http://${network.ip}:${network.port}/listAll`)
      const data = await response.json();
      let data2 = data['locations'];
      let realData = data2['data'];
      let i = 0;
      while (i < realData.length) {
        let temp = realData[i]
        dataTable.nodes.push({"name":temp['user'],"loc":temp['Location']})  //it reads it twice?? not sure why (check console logs)
        console.log(nodes[i]);  //also idk how you update the table, but the data is going into the array
        i++;
      }
     
    }
    const interval=setInterval(()=>{
        getLocations()
      },10000)

      return()=>clearInterval(interval)
  },[])

  return (
    <div className="grow">
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
};
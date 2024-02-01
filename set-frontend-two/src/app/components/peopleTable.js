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
// const nodes = [
//   {
//     id: '420',
//     name: 'Adam Strawbridge',
//   },
// ];



export default function PeopleTable() {
  const dataTable = [];

  
    
    
  

  useEffect(() => {
    const getLocations = async () => {
      const response = await fetch(`http://${network.ip}:${network.port}/getAll`)
      const data = await response.json();
      data.then((data) => {
      for(value in data){
        dataTable.push({"name":value["User"],"loc":value["Location"]})
      }})
    }
      getLocations()
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
                <Row key={item.id} item={item}>
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
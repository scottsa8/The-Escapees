// TODO: Implement fetchData function to fetch data from server

import React, { useState, useEffect } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { network } from "../layout";
import RoomSelector from './roomSelector';

export default function Chart() {
  const [data, setData] = useState([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');



  const [selectedRoom, setSelectedRoom] = useState(null);

  const handleLocationChange = (newLocation) => {
    setSelectedRoom(newLocation);
  };

  

  const getEnvData = async () => {
    const response = await fetch(`http://${network.ip}:${network.port}/getEnv?loc=${selectedRoom}&order=ASC`,
    {mode: 'cors',headers: {'Access-Control-Allow-Origin':'*'}})        
    const data = await response.json();
    let data2 = data['environment'];
    let data3 = data2['data'];
    let out =[]
      for(let x=0;x<data3.length;x++){
        let realData = data3[x]; //index of the data you want from array 0 = most recent
        out.push({
          "timestamp": new Date(realData['Timestamp']),
          "name":selectedRoom,
          "temp":realData['Temperature'],
          "noise":realData['NoiseLevel'],
          "light":realData['LightLevel']
        });  
      }
    return out;   
  };


  useEffect(() => {
    getEnvData().then(data => {
      setData(data);
      console.log(data);
    });
  }, [selectedRoom]);
  


  const roomData = data.filter(item => item.name === selectedRoom);
  const timeRangeMs = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000,
    '1Y': 365 * 24 * 60 * 60 * 1000
  };
  const filteredData = roomData.filter(item => Date.now() - item.timestamp <= timeRangeMs[selectedTimeRange]);
  

  const handleTimeRangeChange = (range) => {
    setSelectedTimeRange(range);
  };

  // function generateRandomData() {
  //   const data = [];
  //   const startDate = new Date('2023-02-01T00:00:00').getTime();
  //   for (let i = 0; i < 1000; i++) {
  //     const timestamp = new Date(startDate + i  * 10 * 3600 * 1000);
  //     if (timestamp > Date.now()) {break;}
  //     const name = Math.random() < 0.5 ? 'Room A' : 'Room B';
  //     const temp = Math.floor(Math.random() * 30);
  //     const noise = Math.floor(Math.random() * (200-50)+50);
  //     const light = Math.floor(Math.random() * (1000-200)+200);
  //     data.push({ timestamp, name, temp, noise, light });
  //   }
  //   return data;
  // }

  return (
    <div className="card-container">
      <div className="flex mb-5">
        <RoomSelector onLocationChange={handleLocationChange} />
      </div>
      <div className="flex flex-wrap flex-row">
      <ResponsiveContainer aspect={3} width="45%">
        <LineChart data={filteredData} key={data.length}>
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="timestamp"/>
          <YAxis/>
          <Tooltip contentStyle={{ backgroundColor: '#435585', color: '#F5E8C7' }} />
          <Legend />
          <Line dataKey="noise" name="Noise" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>

      <ResponsiveContainer aspect={3} width="45%">
        <LineChart data={filteredData} key={data.length}>
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="timestamp"/>
          <YAxis/>
          <Tooltip contentStyle={{ backgroundColor: '#435585', color: '#F5E8C7' }} />
          <Legend />
          <Line dataKey="temp" name="Temperature" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>

      <ResponsiveContainer aspect={3} width="45%">
        <LineChart data={filteredData} key={data.length}>
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="timestamp"/>
          <YAxis/>
          <Tooltip contentStyle={{ backgroundColor: '#435585', color: '#F5E8C7' }} />
          <Legend />
          <Line dataKey="light" name="Light" stroke="#FFA500" />
        </LineChart>
      </ResponsiveContainer>
      </div>
      <div className="flex justify-center mt-4">
        <button
          onClick={() => handleTimeRangeChange('24h')}
          className={`mr-2 hover:no-underline hover:text-cyan-600 ${selectedTimeRange === '24h' ? 'text-white' : 'text-blue-700'}`}
        >
          24h
        </button >
        <button
          onClick={() => handleTimeRangeChange('7d')}
          className={`mr-2 hover:no-underline hover:text-cyan-600 ${selectedTimeRange === '7d' ? 'text-white' : 'text-blue-700'}`}
        >
          7d
        </button>
        <button
          onClick={() => handleTimeRangeChange('30d')}
          className={`mr-2 hover:no-underline hover:text-cyan-600 ${selectedTimeRange === '30d' ? 'text-white' : 'text-blue-700'}`}
        >
          30d
        </button>
        <button
          onClick={() => handleTimeRangeChange('90d')}
          className={`mr-2 hover:no-underline hover:text-cyan-600 ${selectedTimeRange === '90d' ? 'text-white' : 'text-blue-700'}`}
        >
          90d
        </button>
        <button
          onClick={() => handleTimeRangeChange('1Y')}
          className={`mr-2 hover:no-underline hover:text-cyan-600  ${selectedTimeRange === '1Y' ? 'text-white' : 'text-blue-700'}`}
        >
          1Y
        </button>
      </div>
    </div>
  );
}
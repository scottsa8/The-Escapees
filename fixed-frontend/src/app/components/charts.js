import React, { useState, useEffect } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Chart() {
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await fetch(`http://${network.ip}:${network.port}/getEnv?loc=cell1`);        
  //       const data = await response.json();
  //       let data2 = data['environment'];
  //       let data3 = data2['data'];
        
  //       setData(prevData => prevData.concat(data3));
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     }
  //   };
  
  //   fetchData();
  // }, []);
  // const [data, setData] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('Room A');
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const data = generateRandomData();
  const roomData = data.filter(item => item.name === selectedRoom);
  const timeRangeMs = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000,
    '1Y': 365 * 24 * 60 * 60 * 1000
  };
  const filteredData = roomData.filter(item => Date.now() - item.timestamp <= timeRangeMs[selectedTimeRange]);
  
  const handleRoomChange = (e) => {
    setSelectedRoom(e.target.value);
  };

  const handleTimeRangeChange = (range) => {
    setSelectedTimeRange(range);
  };

  function generateRandomData() {
    const data = [];
    const startDate = new Date('2023-02-01T00:00:00').getTime();
    for (let i = 0; i < 1000; i++) {
      const timestamp = new Date(startDate + i  * 10 * 3600 * 1000);
      if (timestamp > Date.now()) {break;}
      const name = Math.random() < 0.5 ? 'Room A' : 'Room B';
      const temp = Math.floor(Math.random() * 30);
      const noise = Math.floor(Math.random() * (200-50)+50);
      const light = Math.floor(Math.random() * (1000-200)+200);
      data.push({ timestamp, name, temp, noise, light });
    }
    return data;
  }



  return (
    <div className="card-container">
      <div className="flex justify-end mb-5">
        <select value={selectedRoom} onChange={handleRoomChange} className="p-2 border rounded-md shadow-md">
          <option value="Room A">Room A</option>
          <option value="Room B">Room B</option>
        </select>
      </div>
      <ResponsiveContainer aspect={3} width="55%">
        <LineChart data={filteredData}>
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="timestamp"/>
          <YAxis/>
          <Tooltip contentStyle={{ backgroundColor: '#435585', color: '#F5E8C7' }} />
          <Legend />
          <Line dataKey="noise" name="Noise" stroke="#82ca9d" />
          <Line dataKey="temp" name="Temperature" stroke="#8884d8" />
          <Line dataKey="light" name="Light" stroke="#FFA500" />
        </LineChart>
      </ResponsiveContainer>
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

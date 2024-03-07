import React, { useState, useEffect } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { network } from "../layout";
import RoomSelector from './roomSelector';
import { getEnvData } from './apiFetcher';
export default function Chart() {
  const [data, setData] = useState([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const isMobile = navigator.userAgent.includes("Android")
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    if (selectedRoom) {
      getEnvData(selectedRoom).then(data => {
        setData(data);
        console.log(data);
      });
    }
  }, [selectedRoom]);

  const timeRangeMs = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000,
    '1Y': 365 * 24 * 60 * 60 * 1000
  };
  const filteredData = data.filter(item => Date.now() - item.timestamp <= timeRangeMs[selectedTimeRange]);
  const getMaxValue = (data, key) => Math.max(...data.map(item => item[key]));
  return (
    <div className="card-container">
      <div className="flex mb-5">
        <RoomSelector onLocationChange={setSelectedRoom} />
      </div>
      {selectedRoom && (
      <div className="graphs">
        <div className="flex flex-wrap flex-row">
        <ResponsiveContainer aspect={3} width={isMobile?"100%":"50%"}>
          <LineChart data={filteredData} key={data.length}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="timestamp"/>
            <YAxis domain={[0, getMaxValue(filteredData, 'noise')]}/>
            <Tooltip contentStyle={{ backgroundColor: '#435585', color: '#F5E8C7' }} />
            <Legend />
            <Line dataKey="noise" name="Noise" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>

        <ResponsiveContainer aspect={3} width={isMobile?"100%":"50%"}>
          <LineChart data={filteredData} key={data.length}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="timestamp"/>
            <YAxis domain={[0, getMaxValue(filteredData, 'temp')]} />
            <Tooltip contentStyle={{ backgroundColor: '#435585', color: '#F5E8C7' }} />
            <Legend />
            <Line dataKey="temp" name="Temperature" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>

        <ResponsiveContainer aspect={3} width={isMobile?"100%":"50%"}>
          <LineChart data={filteredData} key={data.length}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="timestamp"/>
            <YAxis domain={[0, getMaxValue(filteredData, 'light')]}/>
            <Tooltip contentStyle={{ backgroundColor: '#435585', color: '#F5E8C7' }} />
            <Legend />
            <Line dataKey="light" name="Light" stroke="#FFA500" />
          </LineChart>
        </ResponsiveContainer>
        </div>
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setSelectedTimeRange('24h')}
            className={`mr-2 hover:no-underline hover:text-cyan-600 ${selectedTimeRange === '24h' ? 'text-white' : 'text-blue-700 dark:text-blue-200'}`}
          >
            24h
          </button >
          <button
            onClick={() => setSelectedTimeRange('7d')}
            className={`mr-2 hover:no-underline hover:text-cyan-600 ${selectedTimeRange === '7d' ? 'text-white' : 'text-blue-700 dark:text-blue-200'}`}
          >
            7d
          </button>
          <button
            onClick={() => setSelectedTimeRange('30d')}
            className={`mr-2 hover:no-underline hover:text-cyan-600 ${selectedTimeRange === '30d' ? 'text-white' : 'text-blue-700 dark:text-blue-200'}`}
          >
            30d
          </button>
          <button
            onClick={() => setSelectedTimeRange('90d')}
            className={`mr-2 hover:no-underline hover:text-cyan-600 ${selectedTimeRange === '90d' ? 'text-white' : 'text-blue-700 dark:text-blue-200'}`}
          >
            90d
          </button>
          <button
            onClick={() => setSelectedTimeRange('1Y')}
            className={`mr-2 hover:no-underline hover:text-cyan-600  ${selectedTimeRange === '1Y' ? 'text-white' : 'text-blue-700 dark:text-blue-200'}`}
          >
            1Y
          </button>
        </div>
      </div>
      )}
      <div className="flex justify-center mt-4">
        <input 
          type="date" 
          value={selectedDate} 
          onChange={(e) => setSelectedDate(e.target.value)} 
          className="mr-2 text-black dark:text-white bg-white dark:bg-gray-800 border border-gray-300 rounded-md px-2 py-1"
        />
        <button 
          onClick={() => window.open(`http://${network.ip}:${network.port}/genReport?day=${selectedDate}`, '_blank')} 
          className="mr-2 hover:no-underline hover:text-cyan-600 text-blue-700 dark:text-blue-200"
        >
          Generate Report
        </button>
      </div>
    </div>
  );
}
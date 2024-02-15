import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Chart({ }) {
  const data = [
    {
      "name": "Room A",
      "temp": 4000,
      "noise": 2400,
      "light": 2400
    },
    {
      "name": "Room A",
      "temp": 5000,
      "noise": 1400,
      "light": 3400
    },
    {
      "name": "Room B",
      "temp": 2000,
      "noise": 1400,
      "light": 4400
    },
    {
      "name": "Room B",
      "temp": 5000,
      "noise": 3400,
      "light": 4400
    }]
  return (
    <div className="card-container z-50">
      <ResponsiveContainer aspect={3} width="95%">
          <LineChart data={data}>
            <XAxis dataKey="name" scale="auto"/>
            <CartesianGrid stroke="#ccc" />
            <YAxis />
            <Tooltip contentStyle={{ backgroundColor: '#435585', color: '#F5E8C7' }} />
            <Line type="monotone" dataKey="noise" stroke="#8884d8" />
            <Line type="monotone" dataKey="temp" stroke="#82ca9d" />
            <Line type="monotone" dataKey="light" stroke="#8884d8" />
          </LineChart>
      </ResponsiveContainer>
  </div>
  );
}
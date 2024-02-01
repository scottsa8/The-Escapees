'use client';

import {useState, useEffect} from 'react';

function Card({ title, children, width, height }) {
  return (
    <div className="card" style={{ width: width, height: height }}>
      <div className="card-title">{title}</div>
      <div className="card-content">{children}</div>
    </div>
  );
}

function CardContainer({ children }) {
  return <div className="card-container">{children}</div>;
}

function UserButton({ username }) {
  return (
    <div className="user-button">
      <span>{username}</span>
      <img src="https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png" alt="User Logo" />
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [names, setNames] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8080/listAll')
      .then(response => response.json())
      .then(data => setData(data));

    fetch('http://localhost:8080/getAllNames')
      .then(response => response.json())
      .then(names => setNames(names));
  }, []);

  return (
    <body>
      <div className="sidebar">
        <button className="sidebar-button">Button 1</button>
        <button className="sidebar-button">Button 2</button>
        <button className="sidebar-button">Button 3</button>
      </div>
      <div className="banner">
        <h1 className="title">Dashboard</h1>
        <UserButton username="Username" />
      </div>
      <CardContainer>
        <Card title="Card 1" width="200px" height="200px">
          {data ? JSON.stringify(data, null, 2) : 'Loading...'}
        </Card>
        <Card title="Card 2" width="200px" height="200px">
          {names ? JSON.stringify(names, null, 2) : 'Loading...'}
        </Card>
        <Card title="Card 3" width="200px" height="200px">Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</Card>
        <Card title="Card 4" width="400px" height="400px">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</Card>
        <Card title="Card 5" width="300px" height="200px">Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</Card>
        <Card title="Card 6" width="300px" height="200px">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</Card>
      </CardContainer>
    </body>
  );
}
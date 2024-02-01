'use client'
import { useState } from "react";
import PeopleTable from "../components/peopleTable";
import EnviromentContainer from "../components/enviroment";
import LocationCountBox from "../components/locationNumber";

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

function FrontPage(){
  return(
    // <CardContainer>
    <>
        <Card title="Card 1" width="200px" height="200px">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Card>
        <Card title="Card 2" width="200px" height="200px">Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</Card>
        <Card title="Card 3" width="200px" height="200px">Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</Card>
        <Card title="Card 4" width="400px" height="400px">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</Card>
        <Card title="Card 5" width="300px" height="200px">Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</Card>
        <Card title="Card 6" width="300px" height="200px">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</Card>
      {/* </CardContainer> */}
      </>
  );
}

function InteractivePage(){
  return(
    <>
      
      <EnviromentContainer/>
      <LocationCountBox/>
    </>
  )
}

// function Table(){
//   return(
//     <CardContainer>
      
//     </CardContainer>
//   )
// }

export default function Dashboard() {
  const views = {
    "frontpage": <FrontPage/>,
    "table": <PeopleTable/>,
    "test": <InteractivePage/>
  }

  const[currentView,setView] = useState("test")

  // function showView(viewName){
  //   this.setState({displayedView: viewName})
  // }

  return (
    <body>
      <div className="sidebar">
        <button className="sidebar-button" onClick={() => setView("test")}>FrontPage</button>
        <button className="sidebar-button" onClick={() => setView("table")}>Individuals</button>
        {/* <button className="sidebar-button" onClick={() => setView("test")}>Button 3</button> */}
      </div>
      <div className="banner">
        <h1 className="title">Dashboard</h1>
        <UserButton username="Username" />
      </div>
      {/* <CardContainer>
        <Card title="Card 1" width="200px" height="200px">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Card>
        <Card title="Card 2" width="200px" height="200px">Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</Card>
        <Card title="Card 3" width="200px" height="200px">Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</Card>
        <Card title="Card 4" width="400px" height="400px">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</Card>
        <Card title="Card 5" width="300px" height="200px">Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</Card>
        <Card title="Card 6" width="300px" height="200px">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</Card>
      </CardContainer> */}
      <CardContainer>
       {views[currentView]}
      </CardContainer>
      
    </body>
  );
}
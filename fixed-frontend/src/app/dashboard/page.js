'use client'
import { useState } from "react";
import PeopleTable from "../components/peopleTable";
import EnviromentContainer from "../components/enviroment";
import LocationCountBox from "../components/locationNumber";
import Settings from "../components/settings";

export function sendNotification(title, options) {
  // Check browser support
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  }

  // Check for permission
  else if (Notification.permission === "granted") {
    new Notification(title, options);
  }

  // Request permission
  else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function (permission) {
      if (permission === "granted") {
        new Notification(title, options);
      }
    });
  }

}
// sendNotification('Hello!', { body: 'You have a new message.'});

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


function InteractivePage(){
  return(
    <>
      <EnviromentContainer/>
      <LocationCountBox/>
    </>
  )
}



export default function Dashboard() {
  const views = {

    "table": <PeopleTable/>,
    "test": <InteractivePage/>,
    "settings": <Settings/>
  }

  const[currentView,setView] = useState("test")


  return (
    <body>
      <div className="sidebar dark:bg-gray-700 dark:text-blue-100">
        <button className="sidebar-button" onClick={() => setView("test")}>FrontPage</button>
        <button className="sidebar-button" onClick={() => setView("table")}>Individuals</button>
        <button className="sidebar-button" onClick={() => setView("settings")}>Settings</button>
      </div>
      <div className="banner dark:bg-gray-700 dark:text-neutral-50">
        <h1 className="title dark:text-neutral-50">Dashboard</h1>
        <UserButton username="Username" />
      </div>
      <CardContainer>
       {views[currentView]}
      </CardContainer>
      
    </body>
  );
}
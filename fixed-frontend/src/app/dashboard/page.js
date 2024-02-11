'use client'
import { useState } from "react";
import LocationTable from "../components/LocationTable";
import UserButton from "../components/UserButton";
import HomePage from "./HomePage";
import InteractiveMap from "../components/map-components";

// Lists the pages for the navigation bar on the dashboard
const views = {
  individualLocations: { page: <LocationTable/>, pageTitle: "Individual Locations"},
  homePage: { page: <HomePage/>, pageTitle: "Dashboard"},
  interactiveMap: {page: <InteractiveMap/>, pageTitle: "Interactive Map"}
}

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

//Used by the user to navigate through pages
//It's the constant border around the main page
const Dashboard = () => {
  const views = {
    "table": <PeopleTable/>,
    "test": <InteractivePage/>,
    "settings": <Settings/>
  }
  
  const [currentView,setView] = useState(views.homePage);

  return (

    <body>
        {/* Used to navigate pages */}
        <div className="sidebar">

          <button className="sidebar-button" onClick={() => setView(views.homePage)}>{views.homePage.pageTitle}</button>
          <button className="sidebar-button" onClick={() => setView(views.individualLocations)}>{views.individualLocations.pageTitle}</button>
          <button className="sidebar-button" onClick={() => setView(views.interactiveMap)}>{views.interactiveMap.pageTitle}</button>

        </div>

        <div className="banner">

          <h1 className="title">{currentView.pageTitle}</h1>
          <UserButton username="Username" /> {/*UPDATE FOR ACTUAL USERNAME*/}


        </div>

        {/* Where the screen contents are shown */}
        <div className="card-container">
          {currentView.page}
        </div>
      </body>
   );
}
export default Dashboard;
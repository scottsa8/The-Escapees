'use client'
import { useState } from "react";
import LocationTable from "../components/LocationTable";
import UserButton from "../components/UserButton";
import HomePage from "./HomePage";
import InteractiveMap from "../components/InteractiveMap";

// Lists the pages for the navigation bar on the dashboard
const views = {
  individualLocations: { page: <LocationTable/>, pageTitle: "Individual Locations"},
  homePage: { page: <HomePage/>, pageTitle: "Dashboard"},
  interactiveMap: {page: <InteractiveMap/>, pageTitle: "Interactive Map"}
}

//Used by the user to navigate through pages
//It's the constant border around the main page
const Dashboard = () => {

  const [currentView,setView] = useState(views.homePage);

  return ( 
    <body>
        {/* Used to navigate pages */}
        <div className="sidebar">

            <button className="sidebar-button" onClick={() => setView(views.homePage)}>{views.homePage.pageTitle}</button>
            <button className="sidebar-button" onClick={() => setView(views.individualLocations)}>{views.individualLocations.pageTitle}</button>
            <button className="interactive-map" onClick={() => setView(views.interactiveMap)}>{views.interactiveMap.pageTitle}</button>

        </div>

        <div className="banner">

            <h1 className="title">{currentView.pageTitle}</h1>
            <UserButton username="Username" /> {/*UPDATE FOR ACTUAL USERNAME*/}

        </div>

        {/* Where the scree contents are shown */}
        <div className="card-container">
            {currentView.page}
        </div>
      
        </body>
   );
}
 
export default Dashboard;
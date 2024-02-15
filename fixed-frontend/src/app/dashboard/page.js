'use client'
import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import LocationTable from "../components/LocationTable";
import UserButton from "../components/UserButton";
import HomePage from "./HomePage";
import InteractiveMap from "../components/map-components";
import Settings from "../components/settings"
import Chart from "../components/charts"
import {getCookie} from "../components/cookies"
import {HomeIcon,LocPin,MapIcon,SettingsIcon,AnalyticsIcon} from "../components/heroIcons"

// Lists the pages for the navigation bar on the dashboard
const views = {
  individualLocations: { page: <LocationTable/>, pageTitle: "Individual Locations"},
  homePage: { page: <HomePage/>, pageTitle: "Dashboard"},
  interactiveMap: {page: <InteractiveMap/>, pageTitle: "Interactive Map"},
  settings: {page: <Settings/>, pageTitle: "Settings"},
  charts: {page: <Chart/>, pageTitle: "Charts"}
}
  
export function sendNotification(title, options){
  //Check browser support 
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

  const[currentView,setView] = useState(views.homePage);
  const [username, setUsername] = useState('');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', (getCookie('theme') || 'light') === 'dark');
    setUsername(getCookie("username"));
  }, []);

  return (

    <body>
        {/* Used to navigate pages */}
        <div className='sidebar'>
          <button className="sidebar-button" onClick={() => setView(views.homePage)}><HomeIcon/></button>
          <button className="sidebar-button" onClick={() => setView(views.individualLocations)}><LocPin/></button>
          <button className="sidebar-button" onClick={() => setView(views.interactiveMap)}><MapIcon/></button>
          <button className="sidebar-button" onClick={() => setView(views.settings)}><SettingsIcon/></button>
          <button className="sidebar-button" onClick={() => setView(views.charts)}><AnalyticsIcon/></button>
        </div>

        <div className="banner">

          <h1 className="title">{currentView.pageTitle}</h1>
          <UserButton username={username} />
        </div>

        {/* Where the screen contents are shown */}
        <div className="card-container p-4">
          {currentView.page}
        </div>
      </body>
   );
}
export default Dashboard;
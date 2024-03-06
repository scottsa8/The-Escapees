'use client'
import { useState, useEffect } from "react";
import LocationTable from "../components/LocationTable";
import UserButton from "../components/UserButton";
import HomePage from "./HomePage";
import MapPage from "../components/new-map-components/MapPage"
import Settings from "../components/settings"
import Chart from "../components/charts"
import { getCookie } from "../components/cookies"
import { HomeIcon,LocPin,MapIcon,SettingsIcon,AnalyticsIcon,NotificationIcon } from "../components/heroIcons"
import { useNotification } from "../components/notifications";
import { fetchApi } from "../components/apiFetcher";

// Lists the pages for the navigation bar on the dashboard
const views = {
  individualLocations: { page: <LocationTable/>, pageTitle: "Individual Locations"},
  homePage: { page: <HomePage/>, pageTitle: "Dashboard"},
  interactiveMap: {page: <MapPage/>, pageTitle: "Interactive Map"},
  settings: {page: <Settings/>, pageTitle: "Settings"},
  charts: {page: <Chart/>, pageTitle: "Charts"}
}


//Used by the user to navigate through pages
//It's the constant border around the main page
const Dashboard = () => {

  const [currentView,setView] = useState(views.homePage);
  const [username, setUsername] = useState('');
  const { sendNotification, NotificationComponent } = useNotification();
  const [ showNotifications, setShowNotifications ] = useState(false);
  const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
  console.log(notifications);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', (getCookie('theme') || 'light') === 'dark');
    setUsername(getCookie("username"));
  }, []);

  return (
    <>
      <title>Dashboard - Prison System</title>
      <body>
        

        <div className="banner">

          <h1 className="title">{currentView.pageTitle}</h1>
          <UserButton username={username} />
        </div>

        {/* Used to navigate pages */}
        <div className='topbar md:sidebar'>
          <button className="topbar-button md:sidebar-button" onClick={() => setView(views.homePage)}>Home <HomeIcon/></button>
          <button className="topbar-button md:sidebar-button" onClick={() => setView(views.individualLocations)}>Locations <LocPin/></button>
          <button className="topbar-button md:sidebar-button" onClick={() => setView(views.interactiveMap)}>Map <MapIcon/></button>
          <button className="topbar-button md:sidebar-button" onClick={() => setView(views.charts)}>Analytics <AnalyticsIcon/></button>
          <button className="topbar-button md:sidebar-button" onClick={() => setView(views.settings)}>Settings <SettingsIcon/></button>
        </div>

        {/* Where the screen contents are shown */}
        <div className="card-container p-4">
          {currentView.page}
          <button className="fixed right-0 rounded-md m-4 shadow-md bottom-0 flex justify-end p-2 bg-red-600"
          onClick={async () => {
            try {
              await fetchApi('panic');
              sendNotification("Panic Button Pressed", "A panic button has been pressed in the prison system");
            } catch (error) {
              console.error('Error:', error);
            }
          }}
          >Panic</button>
          <button onClick={() => setShowNotifications(!showNotifications)} className="fixed rounded-md m-4 ml-8 shadow-md bottom-0 flex justify-end p-2 bg-red-600"><NotificationIcon/></button>
          {showNotifications && (
            <div>
              {notifications.map((notification, index) => (
                <div className="card ml-6 p-4" key={index}>
                  <h1>{notification.title}</h1>
                  <p>{notification.options}</p>
                </div>
              ))}
            </div>
          )}
          <NotificationComponent />
        </div>
      </body>
    </>
   );
}
export default Dashboard;
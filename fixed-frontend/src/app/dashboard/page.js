'use client'
import { useState, useEffect } from "react";
import LocationTable from "../components/LocationTable";
import UserButton from "../components/UserButton";
import HomePage from "./HomePage";
import MapPage from "../components/new-map-components/MapPage"
import Settings from "../components/settings"
import Chart from "../components/charts"
import MicroManager from "../components/MicroManager"
import { getCookie } from "../components/cookies"
import { HomeIcon,LocPin,MapIcon,SettingsIcon,AnalyticsIcon,NotificationIcon,CPUIcon } from "../components/heroIcons"
import { useNotification } from "../components/notifications";
import { fetchApi } from "../components/apiFetcher";
import dynamic from "next/dynamic";
import Image from "next/image";

// Lists the pages for the navigation bar on the dashboard
const views = {
  individualLocations: { page: <LocationTable/>, pageTitle: "Individual Locations"},
  homePage: { page: <HomePage/>, pageTitle: "Dashboard"},
  interactiveMap: {page: <MapPage/>, pageTitle: "Interactive Map"},
  settings: {page: <Settings/>, pageTitle: "Settings"},
  charts: {page: <Chart/>, pageTitle: "Charts"},
  microManager: {page: <MicroManager/>, pageTitle: "Microbit Manager"}
}

const brands = {
  prison : <Image src="/prison-logo.png" height={50} width={70} />
}


//Used by the user to navigate through pages
//It's the constant border around the main page
const Dashboard = () => {

  const [currentView,setView] = useState(views.homePage);
  const [username, setUsername] = useState('');
  const { sendNotification, NotificationComponent } = useNotification();
  const [ showNotifications, setShowNotifications ] = useState(false); 
  const [currentBrand,setBrand] = useState(brands.prison);
  const [deleting, setDeleting] = useState(null);

  var notifications = null;
  if (typeof window !== 'undefined') {
    notifications = JSON.parse(localStorage.getItem('notifications')) || [];
  }else{}

  const deleteNotification = (index) => {
    setDeleting(index);
    setTimeout(() => {
      const newNotifications = [...notifications];
      newNotifications.splice(index, 1);
      localStorage.setItem('notifications', JSON.stringify(newNotifications));
      setDeleting(null);
    }, 200);
  }

  useEffect(() => {
    document.documentElement.classList.toggle('dark', (getCookie('theme') || 'light') === 'dark');
    setUsername(getCookie("username"));
  }, []);

  const viewChangeHandler = (view) => {
    setView(view);
    if (typeof document !== 'undefined') {
      document.title = `${currentView.pageTitle} - Prison System`
    }
  }

  if (typeof document !== 'undefined') {
    document.title = `${currentView.pageTitle} - Prison System`
  }

  return (
    <>
      {/* <title>{currentView.pageTitle} - Prison System</title> */}
      <body>
        

        <div className="banner">
          <div className="flex px-4">
            {/* <Image src="/prison-logo.png" height={50} width={70} /> */}
            {currentBrand}
            <div className="divider"></div>
            {/* margin-right: 1rem;border-right: 1px solid white;margin-left: 1rem; */}
            <h1 className="title">{currentView.pageTitle}</h1> 
          </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="rounded-md shadow-md p-2 bg-red-600"><NotificationIcon/></button>
            {showNotifications && (
              <div className="notif-box absolute -ml-16 top-full mt-2 overflow-y-auto max-h-64 w-64">
                {notifications.map((notification, index) => (
                  <div className={`notif-card ml-6 p-4 mb-2 relative ${deleting === index ? 'deleting' : ''}`} key={index}>  
                        <button onClick={() => deleteNotification(index)} className="absolute top-0 right-0 p-1">X</button>
                    <h1>{notification.title}</h1>
                    <p>{notification.options}</p>
                  </div>
                ))}
              </div>
            )}
            </div>
            <UserButton username={username} className="p-2"/>
          </div>
        </div>

        {/* Used to navigate pages */}
        <div className='topbar md:sidebar'>
          <button className="topbar-button md:sidebar-button" onClick={() => viewChangeHandler(views.homePage)}>Home <HomeIcon/></button>
          <button className="topbar-button md:sidebar-button" onClick={() => viewChangeHandler(views.individualLocations)}>Locations <LocPin/></button>
          <button className="topbar-button md:sidebar-button" onClick={() => viewChangeHandler(views.interactiveMap)}>Map <MapIcon/></button>
          <button className="topbar-button md:sidebar-button" onClick={() => viewChangeHandler(views.charts)}>Analytics <AnalyticsIcon/></button>
          <button className="topbar-button md:sidebar-button" onClick={() => viewChangeHandler(views.settings)}>Settings <SettingsIcon/></button>
          <button className="topbar-button md:sidebar-button" onClick={() => viewChangeHandler(views.microManager)}>Microbit Manager<CPUIcon/></button>
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
          <NotificationComponent />
        </div>
      </body>
    </>
   );
}
// export default Dashboard;
export default dynamic(() => 
  Promise.resolve(Dashboard),{ ssr: false
});
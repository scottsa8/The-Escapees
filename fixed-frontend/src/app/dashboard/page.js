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
import { useQuery } from "react-query";

// Lists the pages for the navigation bar on the dashboard


const brandImages = {
  Prison : {
    light: <Image src="/prison-logo.png" height={50} width={70} />,
    dark: <Image src="/prison-logo-dark-mode.png" height={50} width={70} />
  },
  Hotel : {
    light:<Image src="/hotel-logo.png" height={50} width={70} />,
    dark: <Image src="/hotel-logo-dark-mode.png" height={50} width={70} />
  }
}



const themes = {
  Prison: {
    cssRules:{
    "--light-body-background": "#EAEAEB",
    "--light-banner-colour": "#B7B6B7",
    "--light-sidebar": "#D9D9D9",
    "--light-title-colour": "black",

    "--dark-body-background": "#22314f",
    "--dark-sidebar-background": "#1b2030",
    "--dark-sidebar-main": "#DBE9FE",
    "--dark-banner-gradient": "linear-gradient(to right, #1d2232, #1b2030)",
    "--dark-title-colour": "#dbeafe"
    },
    lightImage: <Image src="/prison-logo.png" height={50} width={70} />,
    darkImage: <Image src="/prison-logo-dark-mode.png" height={50} width={70} />
  },
  Hotel: {
    cssRules:{
      "--light-body-background": "#fffde3",
      "--light-banner-colour": "#ffee97",
      "--light-sidebar": "#ffee97",
      "--light-title-colour": "black",

      "--dark-body-background": "#22314f",
      "--dark-sidebar-background": "#1b2030",
      "--dark-sidebar-main": "#DBE9FE",
      "--dark-banner-gradient": "linear-gradient(to right, #5D2E0C, #5D2E0C)",
      "--dark-title-colour": "#dbeafe"
    },
    light:<Image src="/hotel-logo.png" height={50} width={70} />,
    dark: <Image src="/hotel-logo-dark-mode.png" height={50} width={70} />,
  }
}


//Used by the user to navigate through pages
//It's the constant border around the main page
const Dashboard = () => {

  const { data: selectedDomain, refetch: refetchSelectedDomain } = useQuery('selectedDomain', () => fetchApi("getDomain"), { initialData:'Prison' });
  const [username, setUsername] = useState('');
  const { sendNotification, NotificationComponent } = useNotification();
  const [ showNotifications, setShowNotifications ] = useState(false); 
  
  const [isLightTheme,setLightTheme] = useState(true)
  const [deleting, setDeleting] = useState(null);

  const [currentDomain, setDomain] = useState("Prison")
  // const [currentTheme,setTheme] = useState(themes[currentDomain]);

  const changeDomainStyling = (domain) => {
    if (typeof document !== 'undefined'){
      setDomain(domain)
      refetchSelectedDomain()
      const root = document.querySelector(':root');
      const setVariables = vars => Object.entries(vars).forEach(v => root.style.setProperty(v[0], v[1]));
      setVariables(themes[currentDomain].cssRules)
    }
  }

  const views = {
    individualLocations: { page: <LocationTable/>, pageTitle: "Individual Locations"},
    homePage: { page: <HomePage/>, pageTitle: "Dashboard"},
    interactiveMap: {page: <MapPage/>, pageTitle: "Interactive Map"},
    settings: {page: <Settings dashThemeHook={setLightTheme}  dashDomainChange={changeDomainStyling}/>, pageTitle: "Settings"},
    charts: {page: <Chart/>, pageTitle: "Charts"},
    microManager: {page: <MicroManager/>, pageTitle: "Microbit Manager"}
  }

  const [currentView,setView] = useState(views.homePage);

  

  var notifications = null;
  if (typeof window !== 'undefined') {
    notifications = JSON.parse(localStorage.getItem('notifications')) || [];
  }else{}

  const deleteNotification = (index) => {
    const newNotifications = [...notifications];
    setDeleting(index);
    setTimeout(() => {
      newNotifications.splice(index, 1);
      localStorage.setItem('notifications', JSON.stringify(newNotifications));
      setDeleting(null);
    }, 200);
  }

  useEffect(() => {
    document.documentElement.classList.toggle('dark', (getCookie('theme') || 'light') === 'dark');
    setLightTheme(getCookie('theme') === 'light')
    changeDomainStyling(selectedDomain);
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

  useEffect(() => {
    if (notifications.length === 0) {
      setShowNotifications(false);
    }
  }, [notifications.length]);
  
  return (
    <>
      {/* <title>{currentView.pageTitle} - Prison System</title> */}
      <body>
        

        <div className="banner">
          <div className="flex px-4">
            {/* <Image src="/prison-logo.png" height={50} width={70} /> */}
            {isLightTheme?themes[currentDomain].lightImage:themes[currentDomain].darkImage}
            <div className="divider"></div>
            {/* margin-right: 1rem;border-right: 1px solid white;margin-left: 1rem; */}
            <h1 className="title">{currentView.pageTitle}</h1> 
          </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
          <button onClick={() => notifications.length > 0 && setShowNotifications(!showNotifications)} className="relative inline-flex items-center px-5 py-2.5 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
            <span className="sr-only">Notifications</span>
            <NotificationIcon/>
            <div className="absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-2 dark:border-gray-900">
              {notifications.length}
            </div>
          </button>
          {showNotifications && (
              <div className="notif-box absolute -ml-32 top-full mt-2 overflow-y-auto max-h-64 w-64 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4">
                {notifications.map((notification, index) => (
                  <div className={`notif-card p-4 mb-4 relative bg-gray-100 dark:bg-gray-700 rounded-lg ${deleting === index ? 'deleting' : ''}`} key={index}>  
                    <button onClick={() => deleteNotification(index)} className="absolute top-0 right-0 p-1 text-gray-800 hover:text-red-500 rounded-full">X</button>
                    <h1 className="text-lg font-bold">{notification.title}</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{notification.options}</p>
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
          <button className="topbar-button md:sidebar-button" onClick={() => viewChangeHandler(views.microManager)}>Microbit's<CPUIcon/></button>
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
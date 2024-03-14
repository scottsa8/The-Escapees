'use client'
import { useState, useEffect } from "react";
import LocationTable from "../components/LocationTable";
import UserButton from "../components/UserButton";
import HomePage from "./HomePage";
import MapPage from "../components/new-map-components/MapPage"
import Settings from "../components/settings"
import Chart from "../components/charts"
import MicroManager from "../components/MicroManager"
import { getCookie, setCookie } from "../components/cookies"
import { HomeIcon,LocPin,MapIcon,SettingsIcon,AnalyticsIcon,NotificationIcon,CPUIcon } from "../components/heroIcons"
import { useNotification } from "../components/notifications";
import { fetchApi } from "../components/apiFetcher";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useQuery } from "react-query";
// const util = require('util');






//Used by the user to navigate through pages
//It's the constant border around the main page
const Dashboard = () => {

  const colourSchemes = {
    blue:{
      "--light-body-background": "#EAEAEB",
      "--light-banner-colour": "#B7B6B7",
      "--light-sidebar": "#D9D9D9",
      "--light-title-colour": "black",
      "--light-card": "#BDBDBC",
  
      "--dark-body-background": "#22314f",
      "--dark-sidebar-background": "#1b2030",
      "--dark-sidebar-main": "#DBE9FE",
      "--dark-banner-gradient": "linear-gradient(to right, #1d2232, #1b2030)",
      "--dark-title-colour": "#dbeafe",
      "--dark-card": "#374151",
      },
      orange:{
        "--light-body-background": "#fffde3",
        "--light-banner-colour": "#ffee97",
        "--light-sidebar": "#ffee97",
        "--light-title-colour": "black",
        "--light-card": "#fffde3",
  
        "--dark-body-background": "#22314f",
        "--dark-sidebar-background": "#1b2030",
        "--dark-sidebar-main": "#DBE9FE",
        "--dark-banner-gradient": "linear-gradient(to right, #5D2E0C, #a64e0f)",
        "--dark-title-colour": "#dbeafe",
        "--dark-card": "#846656"
      },
      purple:{
        "--light-body-background": "#e9e1f9",
        "--light-banner-colour": "#c297ff",
        "--light-sidebar": "#c297ff",
        "--light-title-colour": "black",
        "--light-card": "#eee3ff",
  
        "--dark-body-background": "#3a224f",
        "--dark-sidebar-background": "#1b2030",
        "--dark-sidebar-main": "#DBE9FE",
        "--dark-banner-gradient": "linear-gradient(to right, #390c5d, #6a13b0)",
        "--dark-title-colour": "#dbeafe",
        "--dark-card": "#755684"
      },
  }
  
  //Metadata about each domain; branding, colour scheme and titles
  const themes = {
    prison: {
      title: "Prison System",
      cssRules:colourSchemes.blue,
      lightBrand: <Image src="/prison-logo.png" height={50} width={70} />,
      darkBrand: <Image src="/prison-logo-dark-mode.png" height={50} width={70} />,
      lightBg: <Image src="/Prison-Light-Background.png" layout="fill" objectFit="cover" quality={100}/>,
      darkBg: <Image src="/Prison-Dark-Background.png" layout="fill" objectFit="cover" quality={100}/>
    },
    hotel: {
      title: "SCC Luxury",
      cssRules:colourSchemes.orange,
      lightBrand:<Image src="/hotel-logo.png" height={50} width={70} />,
      darkBrand: <Image src="/hotel-logo-dark-mode.png" height={50} width={70} />,
      lightBg: <Image src="/Hotel-Light-Background.png" layout="fill" objectFit="cover" quality={100}/>,
      darkBg: <Image src="/Hotel-Dark-Background.png" layout="fill" objectFit="cover" quality={100}/>
  
    }
  }

  const { data: selectedDomain, refetch: refetchSelectedDomain } = useQuery('selectedDomain', () => fetchApi("getDomain"), { initialData:'prison' });
  const [username, setUsername] = useState('');
  const { sendNotification, NotificationComponent } = useNotification();
  const [ showNotifications, setShowNotifications ] = useState(false); 
  // const [themes,setThemes] = useState(defaultThemes)
  
  const [isLightTheme,setLightTheme] = useState(true)
  const [deleting, setDeleting] = useState(null);

  const [currentDomain, setDomain] = useState(selectedDomain)
  // const [currentTheme,setTheme] = useState(themes[currentDomain]);

  // const setVariables = () =>{ 
  //   console.log(currentDomain)
  //   const rootStyles = document.documentElement.style;
  //   Object.entries(themes[currentDomain].cssRules).forEach(v => rootStyles.setProperty(v[0], v[1]));

  useEffect(() => {
    if (notification) {
      console.log(notification.noti.data[0].maxTemp)
      if (notification.noti.data[0].maxTemp==="true") {
        sendNotification(notification.noti.data[0].roomName + " has reached its max Temperature at " +notification.noti.data[0].timestamp);
      }
      if (notification.noti.data[0].maxNL==="true") {
        sendNotification(notification.noti.data[0].roomName + " has reached its max Noise at "+notification.noti.data[0].timestamp);
      }
      if (notification.noti.data[0].maxLL==="true") {
        sendNotification(notification.noti.data[0].roomName + " has reached its max Light at "+notification.noti.data[0].timestamp);
      }
    }
  }, [notification]);
  
  const changeDomainStyling = (domain) => {
    if (typeof document !== 'undefined'){
      setDomain(domain)
      setCookie("currentDomain",domain)
      // console.log(getCookie("domainThemes"));
      // themes = JSON.parse(getCookie("domainThemes"))
      var domainCSS = JSON.parse(getCookie(domain+"CSS"))
      
      refetchSelectedDomain()
      const root = document.querySelector(':root');
      const setVariables = vars => Object.entries(vars).forEach(v => root.style.setProperty(v[0], v[1]));
      
      setVariables(domainCSS)
    }
  }

  const handleDomainTheme = (domainName,colourScheme) => {
    
    themes[domainName] = {
      title:domainName,
      cssRules:colourSchemes[colourScheme],
      lightBrand:<Image src="/hotel-logo.png" height={50} width={70} />,
      darkBrand: <Image src="/hotel-logo-dark-mode.png" height={50} width={70} />,
      lightBg: <Image src="/Hotel-Light-Background.png" layout="fill" objectFit="cover" quality={100}/>,
      darkBg: <Image src="/Hotel-Dark-Background.png" layout="fill" objectFit="cover" quality={100}/>
    }
    

    setCookie(domainName+"title",domainName);
    setCookie(domainName+"CSS",JSON.stringify(colourSchemes[colourScheme]))
    // var updatedThemes = {...themes,...newTheme}
    // setCookie("domainThemes",JSON.stringify(updatedThemes),(k,v) =>{
    //   if(colourSchemes[k]){
    //     return colourSchemes[k]
    //   }
    // })
    // setThemes(updatedThemes)
    // themes = {...themes,...newTheme}

    
  }
  
// Lists the pages for the navigation bar on the dashboard
  const views = {
    individualLocations: { page: <LocationTable/>, pageTitle: "Individual Locations"},
    homePage: { page: <HomePage/>, pageTitle: "Dashboard"},
    interactiveMap: {page: <MapPage/>, pageTitle: "Interactive Map"},
    settings: {page: <Settings dashThemeHook={setLightTheme}  dashDomainChange={changeDomainStyling} 
    colourSchemes={Object.keys(colourSchemes)} domainThemeUpdate={handleDomainTheme}/>, pageTitle: "Settings"},
    charts: {page: <Chart/>, pageTitle: "Charts"},
    microManager: {page: <MicroManager/>, pageTitle: "Microbit Manager"}
  }

  const [currentView,setView] = useState(views.homePage);

  

  var notifications = null;
  if (typeof window !== 'undefined') {
    notifications = JSON.parse(localStorage.getItem('notifications')) || [];
  }else{}
  const deleteAll = () =>{
      localStorage.removeItem('notifications');
  }
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
    console.log(getCookie("theme")===null)
    
    for (let key in themes){
      if(getCookie(key+"CSS") === null){
        setCookie(key+"CSS",JSON.stringify(themes[key].cssRules))
      }
      if(getCookie(key+"title") === null){
        setCookie(key+"title",JSON.stringify(themes[key].title))
      }
    }

    setLightTheme(getCookie('theme') === null?true:getCookie('theme') === 'light')
    changeDomainStyling(selectedDomain);
    setDomain(getCookie("currentDomain"))
    setUsername(getCookie("username"));
  }, []);

  const viewChangeHandler = (view) => {
    setView(view);
    if (typeof document !== 'undefined') {
      
      document.title = `${currentView.pageTitle} - ${getCookie(currentDomain+"title")}`
    }
  }

  if (typeof document !== 'undefined') {
    console.log("Themes in Body", themes)
    document.title = `${currentView.pageTitle} - ${getCookie(currentDomain+"title")}`
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
        <div className="h-full fixed w-full overflow-hidden -z-10">
          {
          themes[currentDomain] == null ? <div/> : 
          isLightTheme?themes[currentDomain].lightBg:themes[currentDomain].darkBg}
        </div>
        <div className="banner">
          <div className="flex px-4">
            {/* <Image src="/prison-logo.png" height={50} width={70} /> */}
            {
            
            themes[currentDomain] == null ? isLightTheme?themes.prison.lightBrand:themes.prison.darkBrand : 
          isLightTheme?themes[currentDomain].lightBrand:themes[currentDomain].darkBrand}
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
                <button onClick={()=>deleteAll()} className="absolute top-0 right-0 p-1">Clear All </button>
                {notifications.map((notification, index) => (
                  <div className={`notif-card p-4 mb-4 mt-2 relative bg-gray-100 dark:bg-gray-700 rounded-lg ${deleting === index ? 'deleting' : ''}`} key={index}>  
                    <button onClick={() => deleteNotification(index)} className="absolute top-0 right-0 p-1 text-gray-800 hover:text-red-500 rounded-full">X</button>
                    <h1 className="text-lg font-bold">{notification.title}</h1>
                    <p className="mt-7 text-sm text-gray-300 dark:text-gray-600">{notification.options}</p>
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
          {getCookie("username") == "Admin" ?
          <button className="topbar-button md:sidebar-button" onClick={() => viewChangeHandler(views.settings)}>Settings <SettingsIcon/></button>
          <button className="topbar-button md:sidebar-button" onClick={() => viewChangeHandler(views.microManager)}>Microbit's<CPUIcon/></button>:null
                }
        </div>

        {/* Where the screen contents are shown */}
        <div className="card-container p-4">
          
          {currentView.page}
          {fetchApi("getDomain")=="prison"?
          <button className="fixed right-0 rounded-md m-4 shadow-md bottom-0 flex justify-end p-2 bg-red-600"
          onClick={async () => {
            try {
              await fetchApi('panic');
              sendNotification("Panic Button Pressed", "A panic button has been pressed in the "+await fetchApi("getDomain")+ " system at "+(new Date().toUTCString));
            } catch (error) {
              console.error('Error:', error);
            }
          }}
          >Panic</button>:null}
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